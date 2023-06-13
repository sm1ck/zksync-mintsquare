import img from "random-picture";
import axios from "axios";
import * as path from "path";
import * as main from "./main.js";
import fs from "fs";
import { openAsBlob } from "node:fs"; // Node.JS ^19.8
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const __dirname = path.resolve();
const tmpPath = path.join(__dirname, `/tmp.jpg`);

export async function uploadImg(address) {
  const pic = await img.RandomPicture();
  try {
    let response = await axios.get(pic.url, { responseType: "arraybuffer" });
    let buffer = Buffer.from(response.data, "base64");
    console.log(`(ZkSync Era) => ${address}: скачана картинка -> ${pic.url}`);
    let filename = new URL(pic.url).pathname.split("/").pop();
    fs.writeFileSync(tmpPath, buffer);
    let file = await openAsBlob(tmpPath);
    let form = new FormData();
    form.append("file", file, filename);
    let resp = await fetch("https://api.mintsquare.io/files/upload/", {
      method: "POST",
      credentials: "same-origin",
      body: form,
    });
    let link = await resp.text();
    console.log(`(ZkSync Era) => ${address}: загружена картинка -> ${link}`);
    fs.unlinkSync(tmpPath);
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      length: main.randomIntInRange(1, 3),
    }).replace(/_|-/g, "");
    let json = `{"metadata":"{\\"name\\":\\"${randomName}\\",\\"attributes\\":[],\\"image\\":\\"${link}\\"}"}`;
    let resp_meta = await fetch("https://api.mintsquare.io/metadata/upload/", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
      },
      body: json,
    });
    let data_json = await resp_meta.json();
    return data_json.Hash;
  } catch (error) {
    console.log(`(ZkSync Era) => ${address}: ошибка при работе с картинкой ->`);
    console.dir(error);
    try {
      fs.unlinkSync(tmpPath);
    } catch (e) {}
    await main.sleep(1000);
    return uploadImg(address);
  }
}
