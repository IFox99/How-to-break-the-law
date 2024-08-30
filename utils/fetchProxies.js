import https from "https";

export function fetchProxies(callback) {
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
