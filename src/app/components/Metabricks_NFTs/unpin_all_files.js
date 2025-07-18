const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMTg4ODA1Ny0yZDRhLTQ1MzMtOWI4ZS0wZGMxYjEwNmM4YzMiLCJlbWFpbCI6Im1heC5nZXJzaGZpZWxkMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTU4MTU2ZTBjMjdhMDVmMjk2MzYiLCJzY29wZWRLZXlTZWNyZXQiOiI4MDdkMzMwYzg4Mzg0NjRjZGUwNjcxNjg5YTk0ZTBlYTM4NzUyNzIzOGNjOGFjYmU2NDk3MDQxYzU1ZDgyMjI0IiwiaWF0IjoxNzIxOTA0MTQzfQ.a-HQcQLNP-bNH4MQ09WDEizl93q88Jj2Hf50C10shOw";
const PIN_QUERY = `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000&includeCount=false`;
const fetch = require("node-fetch");

const wait = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const fetchPins = async () => {
  try {
    console.log("Fetching pins...");
    let pinHashes = [];
    let pageOffset = 0;
    let hasMore = true;

    while (hasMore === true) {
      try {
        const response = await fetch(`${PIN_QUERY}&pageOffset=${pageOffset}`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
          },
        });
        const responseData = await response.json();
        const rows = responseData.rows;

        if (rows.length === 0) {
          hasMore = false;
        }
        const itemsReturned = rows.length;
        pinHashes.push(...rows.map((row) => row.ipfs_pin_hash));
        pageOffset += itemsReturned;
        await wait(300);
      } catch (error) {
        console.log(error);
        break;
      }
    }
    console.log("Total pins fetched: ", pinHashes.length);
    return pinHashes;
  } catch (error) {
    console.log(error);
  }
};

const deletePins = async () => {
  const pinHashes = await fetchPins();
  const totalPins = pinHashes.length;
  let deletedPins = 0;
  try {
    for (const hash of pinHashes) {
      try {
        const response = await fetch(
          `https://api.pinata.cloud/pinning/unpin/${hash}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${PINATA_JWT}`,
            },
          }
        );
        await wait(300);
        deletedPins++;
        process.stdout.write(`Deleted ${deletedPins} of ${totalPins} pins\r`);
      } catch (error) {
        console.log(error);
      }
    }
    console.log("Pins deleted");
  } catch (error) {
    console.log(error);
  }
};

deletePins();
