var assert = require("assert");
var Z80 = require("../src/Z80").default;

// --------------- Memory --------------
function Memory() {}

Memory.prototype.readByte = function(address) {
    return 0;
}
Memory.prototype.readWord = function(address) {
    return 0;
}
Memory.prototype.writeByte = function(address, data) {}
Memory.prototype.writeWord = function(address, data) {}

// --------------- IO -------------------
function IO() {}

IO.prototype.read = function(address) {
    return 0;
}
IO.prototype.write = function(address, data) {}

// #reset()
var z80 = new Z80(new Memory(), new IO());
z80.reset();

assert.equal(z80.af, 0);
assert.equal(z80.bc, 0);
assert.equal(z80.de, 0);
assert.equal(z80.pc, 0);
assert.equal(z80.sp, 0);
assert.equal(z80.i, 0);
assert.equal(z80.r, 0);
assert.equal(z80.ix, 0);
assert.equal(z80.iy, 0);

assert.equal(z80.alt_af, 0);
assert.equal(z80.alt_bc, 0);
assert.equal(z80.alt_de, 0);
assert.equal(z80.alt_hl, 0);

assert.equal(z80.iff1, false);
assert.equal(z80.iff2, false);
assert.equal(z80.im, false);

assert.equal(z80.halted(), false);

// #inc8Bit()
var z80 = new Z80(new Memory(), new IO());
z80.reset();

z80.a = 0;
z80.inc8Bit("a");

assert.equal(z80.a, 1);

assert.equal(z80.flag_h, 0);
assert.equal(z80.flag_z, 0);
assert.equal(z80.flag_n, 0);

// #dec8Bit()
var z80 = new Z80(new Memory(), new IO());
z80.reset();

z80.a = 1;
z80.dec8Bit("a");

assert.equal(z80.a, 0);

assert.equal(z80.flag_h, 0);
assert.equal(z80.flag_z, 1);
assert.equal(z80.flag_n, 1);

// #inc16Bit()
var z80 = new Z80(new Memory(), new IO());
z80.reset();

z80.bc = 0;
z80.inc16Bit("bc");
assert.equal(z80.bc, 1);

// #dec16Bit()
var z80 = new Z80(new Memory(), new IO());
z80.reset();

z80.bc = 1;
z80.dec16Bit("bc");
assert.equal(z80.bc, 0);

// Instructions
var z80 = new Z80(new Memory(), new IO());
z80.reset();

z80.af = 0;
z80.bc = 0;
z80.de = 0;
z80.hl = 0;
z80.alt_af = 0;
z80.alt_bc = 0;
z80.alt_de = 0;
z80.alt_hl = 0;
z80.ix = 0;
z80.iy = 0;
z80.sp = 0;
z80.pc = 0;

z80.i = 0;
z80.r = 0;

z80.iff1 = false;
z80.iff2 = false;
z80.im = false;

z80.isHalted = false;
