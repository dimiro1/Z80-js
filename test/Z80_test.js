var assert = require("assert");
var Z80 = require("../src/Z80").default;
var suite = require("./suite");

// --------------- Memory --------------
function Memory() {
    this.data = new Uint8Array(100);
}

Memory.prototype.readByte = function(address) {
    return this.data[address];
}

Memory.prototype.readWord = function(address) {
    return ((this.readByte(address + 1) << 8) | this.readByte(address));
}

Memory.prototype.writeByte = function(address, data) {
    this.data[address] = data & 0xFF;
}

Memory.prototype.writeWord = function(address, data) {
    this.writeByte(address, data);
    this.writeByte(address + 1, data >> 8);
}

// --------------- IO -------------------
function IO() {}

IO.prototype.read = function(address) {
    return 0;
}

IO.prototype.write = function(address, data) {
    console.log(data);
}

// -----------  Util functions-------------

function populateRegisters(z80, registers) {
    for (key in registers) {
        if (registers.hasOwnProperty(key)) {
            z80[key] = registers[key];
        }
    }
}

function populateMemory(z80, memory) {
    var address = memory.start;
    memory.data.forEach(function(data, i) {
        z80.memory.data[address] = data;
        address++;
    });
}

function testRegisters(z80, expected) {
    for (key in expected) {
        if (expected.hasOwnProperty(key)) {
            it(`${key}`, () => {
                assert.equal(z80[key], expected[key]);    
            });
        }
    }
}

// ----------- Instructions --------------

describe("Z80", () => {
    describe("0x00", () => {
        var z80 = new Z80(new Memory(), new IO());

        var test = suite["00"];
        var input = test.input;
        var expected = test.expected;

        // Registers
        populateRegisters(z80, input.registers);

        // Memory
        populateMemory(z80, input.memory);

        // Executing an Instruction
        z80.executeInstruction();

        // Testing
        testRegisters(z80, expected);
    });
});