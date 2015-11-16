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
var Z80;
(function (Z80_1) {
    var Z80 = (function () {
        function Z80(memory, io) {
            this.OPCODE_T_STATES = [
                4, 16, 7, 6, 4, 4, 7, 4, 4, 11, 7, 6, 4, 4, 7, 4,
                0, 16, 7, 6, 4, 4, 7, 4, 12, 11, 7, 6, 4, 4, 7, 4,
                0, 16, 7, 6, 4, 4, 7, 4, 0, 11, 7, 6, 4, 4, 7, 4,
                0, 16, 7, 6, 4, 4, 7, 4, 0, 11, 7, 6, 4, 4, 7, 4,
                4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
                4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
                4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
                7, 7, 7, 7, 7, 7, 4, 7, 4, 4, 4, 4, 4, 4, 7, 4,
                4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
                4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
                4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
                4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
                0, 10, 0, 0, 0, 11, 7, 0, 0, 0, 0, 0, 0, 0, 7, 0,
                0, 10, 0, 11, 0, 11, 7, 0, 0, 4, 0, 11, 0, 4, 7, 0,
                0, 10, 0, 19, 0, 11, 7, 0, 0, 4, 0, 4, 0, 0, 7, 0,
                0, 4, 0, 4, 0, 11, 7, 0, 0, 0, 0, 0, 0, 4, 7, 0
            ];
            this.memory = memory;
            this.io = io;
            this.tStates = 0;
            this.reset();
        }
        Object.defineProperty(Z80.prototype, "pc", {
            get: function () {
                return this._pc & 0xFFFF;
            },
            set: function (n) {
                this._pc = n & 0xFFFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "sp", {
            get: function () {
                return this._sp;
            },
            set: function (n) {
                this._sp = n & 0xFFFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "a", {
            get: function () {
                return this._a;
            },
            set: function (n) {
                this._a = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "shadowA", {
            get: function () {
                return this._shadow_a;
            },
            set: function (n) {
                this._shadow_a = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "f", {
            get: function () {
                return ((this.flag_s << 0x80) |
                    (this.flag_z << 0x40) |
                    (this.flag_5 << 0x20) |
                    (this.flag_h << 0x10) |
                    (this.flag_3 << 0x08) |
                    (this.flag_pv << 0x04) |
                    (this.flag_n << 0x02) |
                    (this.flag_c << 0x01));
            },
            set: function (n) {
                n &= 0xFF;
                this.flag_s = (n & 0x80);
                this.flag_z = (n & 0x40);
                this.flag_5 = (n & 0x20);
                this.flag_h = (n & 0x10);
                this.flag_3 = (n & 0x08);
                this.flag_pv = (n & 0x04);
                this.flag_n = (n & 0x02);
                this.flag_c = (n & 0x01);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "shadowF", {
            get: function () {
                return this._shadow_f;
            },
            set: function (n) {
                this._shadow_f = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "af", {
            get: function () {
                return (this.a << 8) | (this.f & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.a = n >> 8;
                this.f = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "h", {
            get: function () {
                return this._h;
            },
            set: function (n) {
                this._h = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "l", {
            get: function () {
                return this._l;
            },
            set: function (n) {
                this._l = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "hl", {
            get: function () {
                return (this.h << 8) | (this.l & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.h = (n >> 8) & 0xFF;
                this.l = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "b", {
            get: function () {
                return this._b;
            },
            set: function (n) {
                this._b = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "c", {
            get: function () {
                return this._c;
            },
            set: function (n) {
                this._c = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "bc", {
            get: function () {
                return (this.b << 8) | (this.c & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.b = (n >> 8) & 0xFF;
                this.c = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "d", {
            get: function () {
                return this._d;
            },
            set: function (n) {
                this._d = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "e", {
            get: function () {
                return this._e;
            },
            set: function (n) {
                this._e = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "de", {
            get: function () {
                return (this.d << 8) | (this.e & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.d = (n >> 8) & 0xFF;
                this.e = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "i", {
            get: function () {
                return this._i;
            },
            set: function (n) {
                this._i = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "r", {
            get: function () {
                return this._e;
            },
            set: function (n) {
                this._r = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ir", {
            set: function (n) {
                n &= 0xFFFF;
                this.i = (n >> 8) & 0xFF;
                this.r = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ixh", {
            get: function () {
                return this._ixh;
            },
            set: function (n) {
                this._ixh = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ixl", {
            get: function () {
                return this._ixl;
            },
            set: function (n) {
                this._ixl = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ix", {
            get: function () {
                return (this._ixh << 8) | (this._ixl & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.ixh = (n >> 8) & 0xFF;
                this.ixl = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "iyh", {
            get: function () {
                return this._iyh;
            },
            set: function (n) {
                this._iyh = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "iyl", {
            get: function () {
                return this._iyl;
            },
            set: function (n) {
                this._iyl = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "iy", {
            get: function () {
                return (this._iyh << 8) | (this._iyl & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.iyh = (n >> 8) & 0xFF;
                this.iyl = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Z80.prototype.pop = function () {
            var temp = this.memory.readWord(this.sp);
            this.sp += 2;
            return temp;
        };
        Z80.prototype.reset = function () {
            this.af = 0;
            this.bc = 0;
            this.de = 0;
            this.pc = 0;
            this.sp = 0;
            this.i = 0;
            this.r = 0;
            this.ix = 0;
            this.iy = 0;
            this.shadowA = 0;
            this.shadowF = 0;
            this.isHalted = false;
        };
        Z80.prototype.inc8Bit = function (reg) {
            this[reg]++;
            this.flag_h = ((this[reg] & 0x0f) === 0) ? 1 : 0;
            this.flag_z = (this[reg] === 0) ? 1 : 0;
            this.flag_n = 0;
        };
        Z80.prototype.dec8Bit = function (reg) {
            this[reg]--;
            this.flag_h = ((this[reg] & 0x0f) === 0x0F) ? 1 : 0;
            this.flag_z = (this[reg] === 0) ? 1 : 0;
            this.flag_n = 1;
        };
        Z80.prototype.add16Bit = function (rega, regb) {
            this.flag_n = 1;
            this.flag_h = ((this[rega] & 0xFFF) + (this[regb] & 0xFFF) > 0xFFF) ? 1 : 0;
            this.flag_c = (this[rega] + this[regb] > 0xFFFF) ? 1 : 0;
            this[rega] += this[regb];
        };
        Z80.prototype.getBit = function (x, bit) {
            return x & (1 << bit);
        };
        Z80.prototype.decodeInstruction = function (instruction) {
            this.tStates += this.OPCODE_T_STATES[instruction];
            switch (instruction) {
                case 0x00:
                    break;
                case 0x01:
                    this.bc = this.memory.readWord(this.pc);
                    this.pc += 2;
                    break;
                case 0x02:
                    this.memory.writeByte(this.bc, this.a);
                    break;
                case 0x03:
                    this.bc++;
                    break;
                case 0x04:
                    this.inc8Bit("b");
                    break;
                case 0x05:
                    this.dec8Bit("b");
                    break;
                case 0x06:
                    this.b = this.memory.readByte(this.pc);
                    break;
                case 0x07:
                    this.flag_c = this.getBit(this.a, 7);
                    this.a = ((this.a << 1) & 0xFF) | this.flag_c;
                    this.flag_n = 0;
                    this.flag_h = 0;
                    this.flag_z = 0;
                    break;
                case 0x08:
                    var temp = this.a;
                    this.a = this.shadowA;
                    this.shadowA = temp;
                    temp = this.f;
                    this.f = this.shadowF;
                    this.shadowF = temp;
                    break;
                case 0x09:
                    this.add16Bit("hl", "bc");
                    break;
                case 0x0A:
                    this.a = this.memory.readByte(this.bc);
                    break;
                default:
                    throw new Error("Unknown Instruction: 0x" + instruction);
            }
        };
        Z80.prototype.halted = function () {
            return this.isHalted;
        };
        Z80.prototype.executeInstruction = function () {
            var instruction = this.memory.readByte(this.pc);
            this.isHalted = false;
            this.pc++;
            this.decodeInstruction(instruction);
        };
        Z80.prototype.TStates = function () {
            return this.tStates;
        };
        Z80.prototype.resetTStates = function () {
            this.tStates = 0;
        };
        return Z80;
    })();
    exports.default = Z80;
})(Z80 || (Z80 = {}));
//# sourceMappingURL=Z80.js.map