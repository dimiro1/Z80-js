/*!
 * A Javascript/Typescript Z80 Emulator
 * Copyright (C) 2015  Claudemiro Alves Feitosa Neto <dimiro1@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var assert = require("assert");
var Z80 = require("../src/Z80").default;
var suite = require("./suite");

// --------------- Memory --------------
function Memory() {
    this.data = new Uint8Array(0xFFFF);
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

var NAMES_TABLE = {
    0: "af",
    1: "bc",
    2: "de",
    3: "hl",
    4: "alt_af",
    5: "alt_bc",
    6: "alt_de",
    7: "alt_hl",
    8: "ix",
    9: "iy",
    10: "sp",
    11: "pc",

    12: "i",
    13: "r",

    14: "iff1",
    15: "iff2",

    16: "im",
    17: "isHalted",
    18: "tStates"
};

function populateRegisters(z80, input) {
    input.regs.forEach((value, i) => {
        z80[NAMES_TABLE[i]] = value;
    });
}

function populateMemory(z80, input) {
    if (input.mem.length === 0) {
        return;
    }

    var address = input.mem[0];

    for (var i = 1; i < input.mem.length; i++) {
        z80.memory.data[address++] = input.mem[i];
    }
}

function testRegisters(z80, output) {
    output.regs.forEach((value, i) => {
        it(NAMES_TABLE[i], () => {
            if (NAMES_TABLE[i] === "af") {
                console.log(z80.f.toString(2));
            }
            assert.equal(z80[NAMES_TABLE[i]], value);
        });
    });
}

function testMemory(z80, output, opcode) {
    if (output.mem.length === 0) {
        return;
    }

    var address = output.mem[0];

    output.mem.forEach((value, i) => {
        if (i !== 0) { // Discard the first Element
            it(`Memory: 0x${opcode}`, () => {
                assert.equal(z80.memory.data[address++], value);
            });
        }
    });
}

// ----------- Instructions --------------


var tests = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];

describe("Z80", () => {
    tests.forEach((opcode) => {
        describe(`0x${opcode}`, () => {
            var test = suite.get(opcode);
            var input = test.input;
            var output = test.output;

            // New CPU
            var z80 = new Z80(new Memory(), new IO());

            // Registers
            populateRegisters(z80, input);

            // Memory
            populateMemory(z80, input);

            // Executing an Instruction
            z80.executeInstruction();

            // Testing
            testRegisters(z80, output);

            // Memory
            testMemory(z80, output, opcode);
        });
    });
});