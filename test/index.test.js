const nock = require("nock");
const { Probot, ProbotOctokit } = require("probot");
const prosebotApp = require("..");

const payload = require("./fixtures/pull_request.opened.json");

const badText = `## Hello! How are you?

This is dope. So this is a cat.

So is this is so a cat!

We have confirmed his identity.
`;

describe("prosebot", () => {
  let probot;
  const scope = nock("https://api.github.com");

  beforeEach(() => {
    nock.disableNetConnect();

    probot = new Probot({
      githubToken: "test",
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    prosebotApp(probot);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("creates a `neutral` check run if there are no files to check", async () => {
    expect.assertions(1);

    scope
      .get("/repos/Codertocat/Hello-World/pulls/2/files")
      .query(true)
      .reply(200, [{ filename: "foo.js" }])
      .post("/repos/Codertocat/Hello-World/check-runs")
      .reply(200, (_uri, requestBody) => {
        expect(requestBody).toMatchObject({
          name: "prosebot",
          conclusion: "neutral",
          output: {
            title: "No relevant files",
            summary:
              "There were no `.md` or `.txt` files that needed checking.",
          },
        });
      });

    await probot.receive({ name: "pull_request", payload });
  });

  it("creates all `success` check runs when there are no prose errors for all enabled providers", async () => {
    expect.assertions(3);

    scope
      .get("/repos/Codertocat/Hello-World/pulls/2/files")
      .query(true)
      .reply(200, [{ filename: "no-prose-errors.md", status: "added" }])
      .get("/repos/Codertocat/Hello-World/contents/.github%2Fprosebot.yml")
      .reply(200)
      .get("/repos/Codertocat/Hello-World/contents/no-prose-errors.md")
      .reply(200, "This is great text.")
      .post("/repos/Codertocat/Hello-World/check-runs")
      .times(3)
      .reply(200, (_uri, requestBody) => {
        expect(requestBody).toMatchObject({
          conclusion: "success",
        });
      });

    await probot.receive({ name: "pull_request", payload });
  });

  it.skip("creates a `neutral` check run", async () => {});

  it.skip("only creates a check run for the enabled providers", async () => {});
});
