from algopy import ARC4Contract, BoxMap, Global, GlobalState, Txn, UInt64, arc4


class Message(arc4.Struct):
    sender: arc4.Address
    text: arc4.String
    timestamp: arc4.UInt64


class GuestbookAppContract(ARC4Contract):
    def __init__(self) -> None:
        self.message_count = GlobalState(UInt64(0))
        self.messages = BoxMap(UInt64, Message, key_prefix="msg_")

    @arc4.abimethod(create="require")
    def create(self) -> None:
        pass

    @arc4.abimethod
    def submit_message(self, text: arc4.String) -> None:
        count = self.message_count.value
        count += 1
        self.message_count.value = count

        msg = Message(
            sender=arc4.Address(Txn.sender),
            text=text,
            timestamp=arc4.UInt64(Global.latest_timestamp),
        )
        self.messages[count] = msg.copy()

    @arc4.abimethod(readonly=True)
    def get_message_count(self) -> arc4.UInt64:
        return arc4.UInt64(self.message_count.value)

    @arc4.abimethod(readonly=True)
    def get_message(self, index: arc4.UInt64) -> Message:
        return self.messages[index.native]
