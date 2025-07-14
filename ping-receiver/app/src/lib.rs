#![no_std]
use sails_rs::prelude::*;

#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct PingFromEthereum {
    pub slot: u64,
    pub transaction_index: u32,
    pub receipt_rlp: Vec<u8>,
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Event {
    PingFromEthereum(PingFromEthereum),
}

pub struct PingReceiverService;

#[service(events = Event)]
impl PingReceiverService {
    // Route ID = 0
    pub fn submit_receipt(
        &mut self,
        slot: u64,
        transaction_index: u32,
        receipt_rlp: Vec<u8>,
    ) {
        self.emit_event(Event::PingFromEthereum(PingFromEthereum {
            slot,
            transaction_index,
            receipt_rlp,
        }))
        .expect("Failed to emit event");
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