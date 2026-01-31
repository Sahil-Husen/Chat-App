const badWords = ["bc", "mc", "abuse", "gali"];

function hasBadWords(message) {
  return badWords.some(word =>
    message.toLowerCase().includes(word)
  );
}

module.exports = { hasBadWords };
