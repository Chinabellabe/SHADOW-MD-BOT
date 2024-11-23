const { zokou } = require("../framework/zokou");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

zokou({
  nomCom: "update",
  categorie: "Maintenance",
  reaction: "🔄",
  desc: "Check for new commits and update the bot",
  alias: ["upgrade"]
}, async (origineMessage, zk, commandeOptions) => {
  const { ms, msgRepondu, arg, repondre, nomAuteurMessage } = commandeOptions;

  zk.sendMessage(origineMessage, { text: "ᴄᴏᴍᴍᴀɴᴅᴇ ᴅᴇᴠᴇʟᴏᴘᴘÉ ᴘᴀʀ sʜᴀᴅᴏᴡ-ᴡʀʟᴅ" });

  try {
    const repoUrl = "https://api.github.com/repos/ShadowWrld/SHADOW-MD-BOT";
    const commitsUrl = `${repoUrl}/commits`;

    // Cette partie cherche les commits
    const commitsResponse = await axios.get(commitsUrl);
    const latestCommit = commitsResponse.data[0];

    // Cette partie cherche les informations du dernier commit sur ton repo
    const commitDetailsUrl = latestCommit.url;
    const commitDetailsResponse = await axios.get(commitDetailsUrl);
    const filesChanged = commitDetailsResponse.data.files;

    // Là ça cherche s’il y a des fichiers modifiés
    const localFiles = getLocalFiles(".");
    const filesToUpdate = filesChanged.filter(file => localFiles.includes(file.filename));

    if (filesToUpdate.length === 0) {
      return repondre("ᴘᴀs ᴅᴇ ᴍɪsᴇ à ᴊᴏᴜʀ ᴅéᴛᴇᴄᴛé ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ.ᴘᴀs ᴅᴇ ᴍɪsᴇ à ᴊᴏᴜʀ ᴅéᴛᴇᴄᴛé ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ.");
    }

    repondre(`Mise à jour nécessaire pour les(s) fichiers : ${filesToUpdate.map(file => file.filename).join(", ")}`);

    for (const file of filesToUpdate) {
      const fileUrl = file.raw_url;
      const filePath = path.join(".", file.filename);

      const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, fileResponse.data);

      repondre(`Fichier mis à jour : ${file.filename}`);
    }

    repondre("ᴍɪsᴇ à ᴊᴏᴜʀ ᴛᴇʀᴍɪɴé ᴀᴠᴇᴄ sᴜᴄᴄès.");
  } catch (error) {
    repondre(`Error during update: ${error.message}`);
  }
});

function getLocalFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      files = files.concat(getLocalFiles(itemPath).map(file => path.join(item, file)));
    } else {
      files.push(itemPath);
    }
  }

  return files;
}
