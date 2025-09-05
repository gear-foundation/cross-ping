use sails_rs::prelude::*;

#[sails_rs::event]
#[derive(Encode, Decode, TypeInfo)]
pub enum Event {
    ReceiptSubmitted(u64, u32),
}

pub struct CrossPingReceiverService;

#[sails_rs::service(events = Event)]
impl CrossPingReceiverService {
    #[export]
    pub fn submit_receipt(
        &mut self,
        slot: u64,
        transaction_index: u32,
        _receipt_rlp: Vec<u8>,
    ) -> Result<(), String> {
        self.emit_event(Event::ReceiptSubmitted(slot, transaction_index))
            .map_err(|_| "Failed to emit event".to_string())?;
        Ok(())
    }
}

impl Default for CrossPingReceiverService {
    fn default() -> Self {
        Self
    }
}
