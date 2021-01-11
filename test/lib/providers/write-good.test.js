const WriteGood = require("../../../lib/providers/write-good");

describe("WriteGood provider", () => {
  let provider;

  beforeEach(() => {
    const map = new Map();

    const obj = {
      "filename.md": "# This is some text",
      "anotherfile.md": "this **Has** some Problems. it sure does jason?",
      "cats.md": "So the cat was stolen.",
    };

    for (const key in obj) {
      map.set(key, obj[key]);
    }

    provider = new WriteGood(map);
  });

  describe("#buildResults", () => {
    it("returns the expected result", () => {
      const actual = provider.buildResults();
      expect(actual).toMatchSnapshot();
    });
  });
});
