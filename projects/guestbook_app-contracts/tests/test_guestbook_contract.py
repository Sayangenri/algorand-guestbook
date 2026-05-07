import pytest
from algokit_utils import AlgorandClient, AlgoAmount
from smart_contracts.artifacts.guestbook_app_contract.guestbook_app_contract_client import (
    GuestbookAppContractFactory,
)


@pytest.fixture
def algorand() -> AlgorandClient:
    return AlgorandClient.default_localnet()


@pytest.fixture
def deployer(algorand: AlgorandClient):
    account = algorand.account.random()
    algorand.account.ensure_funded(account.address, AlgoAmount(algo=10))
    return account


@pytest.fixture
def app_client(algorand: AlgorandClient, deployer):
    factory = algorand.client.get_typed_app_factory(
        GuestbookAppContractFactory,
        default_sender=deployer.address,
    )
    result = factory.deploy(on_update="append", on_schema_break="append")
    return result.app_client


def fund_contract(algorand, sender, app_client):
    algorand.send.payment(
        sender=sender.address,
        receiver=app_client.app_address,
        amount=AlgoAmount(algo=1),
    )


def test_submit_and_read_message(algorand, deployer, app_client):
    fund_contract(algorand, deployer, app_client)

    app_client.send.submit_message(text="Hello from deployer!")

    count_result = app_client.send.get_message_count()
    assert count_result.abi_return == 1

    msg_result = app_client.send.get_message(index=1)
    assert msg_result.abi_return.text.native == "Hello from deployer!"
    assert msg_result.abi_return.sender.native == deployer.address


def test_multiple_messages(algorand, deployer, app_client):
    fund_contract(algorand, deployer, app_client)

    app_client.send.submit_message(text="First message")
    app_client.send.submit_message(text="Second message")
    app_client.send.submit_message(text="Third message")

    count_result = app_client.send.get_message_count()
    assert count_result.abi_return == 3

    for i in range(1, 4):
        msg_result = app_client.send.get_message(index=i)
        assert msg_result.abi_return.text.native == f"{'First' if i == 1 else 'Second' if i == 2 else 'Third'} message"


def test_multiple_users(algorand, deployer, app_client):
    fund_contract(algorand, deployer, app_client)

    app_client.send.submit_message(text="From deployer")

    user2 = algorand.account.random()
    algorand.account.ensure_funded(user2.address, AlgoAmount(algo=5))

    client2 = algorand.client.get_typed_app_client_by_id(
        GuestbookAppContractFactory,
        app_id=app_client.app_id,
        default_sender=user2.address,
    )

    client2.send.submit_message(text="From user2")

    count_result = app_client.send.get_message_count()
    assert count_result.abi_return == 2

    msg1 = app_client.send.get_message(index=1)
    assert msg1.abi_return.sender.native == deployer.address

    msg2 = app_client.send.get_message(index=2)
    assert msg2.abi_return.sender.native == user2.address


def test_timestamp_is_set(algorand, deployer, app_client):
    fund_contract(algorand, deployer, app_client)

    app_client.send.submit_message(text="Timestamp test")

    msg_result = app_client.send.get_message(index=1)
    assert msg_result.abi_return.timestamp.native > 0
