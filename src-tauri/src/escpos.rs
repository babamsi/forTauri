use rusb::{Context, DeviceHandle, GlobalContext, UsbContext};
use std::time::Duration;

const ESC: u8 = 0x1B;
const LINE_FEED: u8 = 0x0A;
const CUT_PAPER: [u8; 3] = [ESC, 0x69, 0x00];

pub fn print_receipt(vid: u16, pid: u16, receipt_data: &str) -> Result<(), rusb::Error> {
    let handle = connect_printer(vid, pid)?;
    send_to_printer(&handle, receipt_data.as_bytes())?;
    send_to_printer(&handle, &[LINE_FEED])?;
    send_to_printer(&handle, &CUT_PAPER)?;
    Ok(())
}

fn connect_printer(vid: u16, pid: u16) -> Result<DeviceHandle<GlobalContext>, rusb::Error> {
    let context = Context::new()?;
    for device in context.devices()?.iter() {
        let desc = device.device_descriptor()?;
        if desc.vendor_id() == vid && desc.product_id() == pid {
            let handle = device.open()?;
            handle.claim_interface(0)?;
            return Ok(handle);
        }
    }
    Err(rusb::Error::NotFound)
}

fn send_to_printer(handle: &DeviceHandle<GlobalContext>, data: &[u8]) -> Result<(), rusb::Error> {
    handle
        .write_bulk(0x01, data, Duration::from_secs(5))
        .map(|_| ()) // Map the `usize` result to `()`
}