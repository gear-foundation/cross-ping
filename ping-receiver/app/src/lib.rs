#![no_std]
use sails_rs::prelude::*;

#[sails_rs::event]
#[derive(Encode, Decode, TypeInfo)]
pub enum Event {
    ReceiptSubmitted(u64, u32),
}

pub struct PingReceiverService;

#[service(events = Event)]
impl PingReceiverService {
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

pub struct PingReceiverProgram;

#[sails_rs::program]
impl PingReceiverProgram {
    pub fn new() -> Self {
        Self
    }

    pub fn ping_receiver(&self) -> PingReceiverService {
        PingReceiverService
    }
}

impl Default for PingReceiverProgram {
    fn default() -> Self {
        Self::new()
    }
}