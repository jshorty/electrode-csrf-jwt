"use strict";

const crypto = require("crypto");
const JwtTokenEngine = require("../../lib/jwt-token-engine");
const HashTokenEngine = require("../../lib/hash-token-engine");

describe("token-engine", function() {
  describe("jwt", () => testEngine(JwtTokenEngine, "JwtTokenEngine"));
  describe("sha", () => testEngine(HashTokenEngine, "HashTokenEngine"));
});

function testEngine(TokenEngine, engineName) {
  const secret = crypto.randomBytes(1024);

  it("should have correct constructor name", () => {
    expect(TokenEngine.name).to.equal(engineName);
  });

  it("should create tokens", () => {
    const engine = new TokenEngine({ secret });
    const tokens = engine.create();
    expect(tokens.header, "Should have header token").to.be.ok;
    expect(tokens.cookie, "Should have cookie token").to.be.ok;
  });

  it("should verify tokens", () => {
    const engine = new TokenEngine({ secret });
    const tokens = engine.create();
    expect(tokens.header, "Should have header token").to.be.ok;
    expect(tokens.cookie, "Should have cookie token").to.be.ok;
    const verify = engine.verify(tokens.header, tokens.cookie);
    expect(verify.error, "created token didn't verify").to.be.undefined;
  });

  it("should fail verify invalid tokens", () => {
    const engine = new TokenEngine({ secret });

    const tokens1 = engine.create();
    const tokens2 = engine.create();
    const verify = engine.verify(tokens1.header, tokens2.cookie);
    expect(verify.error, "should get error from verify").to.exist;
    expect(verify.error.message, "error should be INVALID_TOKEN from verify").to.equal(
      "INVALID_TOKEN"
    );
  });

  it("should fail verify for expired tokens", () => {
    const engine = new TokenEngine({ secret, expiresIn: "0s" });
    const tokens = engine.create({});
    const verify = engine.verify(tokens.header, tokens.cookie);
    expect(verify.error, "should get error from verify").to.exist;
    expect(verify.error.message, "error should be INVALID_TOKEN from verify").to.equal(
      "INVALID_TOKEN"
    );
  });

  it("should fail verify for missing tokens", () => {
    const engine = new TokenEngine({ secret });
    const verify = engine.verify("", "");
    expect(verify.error, "should get error from verify").to.exist;
    expect(verify.error.message, "error should be MISSING_TOKEN from verify").to.equal(
      "MISSING_TOKEN"
    );
  });

  it("should use custom uuid generator function", () => {
    const id = "test_0123";
    const engine = new TokenEngine({ secret, uuidGen: () => id });
    const tokens = engine.create({});
    const verify = engine.verify(tokens.header, tokens.cookie);
    expect(verify.error).to.not.exist;
    expect(verify.header.uuid).to.equal(id);
    expect(verify.cookie.uuid).to.equal(id);
  });

  it("should use simple id generator if selected", () => {
    const engine = new TokenEngine({ secret, uuidGen: "simple" });
    const tokens = engine.create({});
    const verify = engine.verify(tokens.header, tokens.cookie);
    expect(verify.error).to.not.exist;
    expect(verify.header.uuid).to.contain("_");
    expect(verify.cookie.uuid).to.contain("_");
  });

  it("should use uuid id generator if selected", () => {
    const engine = new TokenEngine({ secret, uuidGen: "uuid" });
    const tokens = engine.create({});
    const verify = engine.verify(tokens.header, tokens.cookie);
    expect(verify.error).to.not.exist;
    expect(verify.header.uuid).to.contain("-");
    expect(verify.cookie.uuid).to.contain("-");
  });
}
