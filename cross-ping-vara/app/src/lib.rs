#![no_std]
#![allow(static_mut_refs)]

use gbuiltin_eth_bridge::{Request as BridgeRequest, Response as BridgeResponse};
use receiver::CrossPingReceiverService;
use sails_rs::gstd::{exec, msg};
use sails_rs::prelude::*;
use sender::CrossPingSenderService;

pub mod receiver;
pub mod sender;

pub struct CrossPingProgram;

#[sails_rs::program]
impl CrossPingProgram {
    pub fn sender(&self) -> CrossPingSenderService {
        CrossPingSenderService::new()
    }

    pub fn receiver(&self) -> CrossPingReceiverService {
        CrossPingReceiverService::default()
    }
}

impl Default for CrossPingProgram {
    fn default() -> Self {
        Self
    }
}
