use sails_rs::{calls::*, gtest::System};
use sails_rs::gtest::calls::GTestRemoting;
use sails_rs::prelude::*;
use cross_ping_client::traits::*;

const ACTOR_ID: u64 = 42;
const FAKE_DEST: H160 = H160([0x11; 20]); // Fake Ethereum destination

#[tokio::test]
async fn send_ping_works() {
    let system = System::new();
    system.init_logger_with_default_filter("gwasm=debug,gtest=info,sails_rs=debug");
    system.mint_to(ACTOR_ID, 100_000_000_000_000);
    let remoting = GTestRemoting::new(system, ACTOR_ID.into());

    let program_code_id = remoting.system().submit_code(cross_ping::WASM_BINARY);
    let program_factory = cross_ping_client::CrossPingFactory::new(remoting.clone());

    let tx = program_factory.new(FAKE_DEST).send(program_code_id, b"salt").await.expect("send failed");
    let program_id = tx.recv().await.expect("recv failed");

    println!("✔ Program deployed at: {:?}", program_id);

    let mut service_client = cross_ping_client::CrossPing::new(remoting.clone());
    let result = service_client.send_ping().send_recv(program_id).await;

    match result {
        Ok(reply) => {
            println!("✔ send_ping succeeded, reply: {:?}", reply);
        },
        Err(e) => std::panic!("✘ send_ping failed: {:?}", e),
    }
}