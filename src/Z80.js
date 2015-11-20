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
"use strict";
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var Z80 = (function () {
        function Z80(memory, io) {
            var _this = this;
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
            this.OPCODE_CB_STATES = [
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
                8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
                8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
                8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
                8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8
            ];
            this.INSTRUCTIONS = {
                0x00: function () { },
                0x01: function () {
                    _this.bc = _this.memory.readWord(_this.pc);
                    _this.inc2Pc();
                },
                0x02: function () {
                    _this.memory.writeByte(_this.bc, _this.a);
                },
                0x03: function () {
                    _this.inc16Bit("bc");
                },
                0x04: function () {
                    _this.inc8Bit("b");
                },
                0x05: function () {
                    _this.dec8Bit("b");
                },
                0x06: function () {
                    _this.b = _this.memory.readByte(_this.pc);
                    _this.incPc();
                },
                0x07: function () {
                    _this.rlc("a");
                },
                0x08: function () {
                    _this.exafaf();
                },
                0x09: function () {
                    _this.add16Bit("hl", "bc");
                },
                0x0A: function () {
                    _this.a = _this.memory.readByte(_this.bc);
                },
                0x0B: function () {
                    _this.dec16Bit("bc");
                },
                0x0C: function () {
                    _this.inc8Bit("c");
                },
                0x0D: function () {
                    _this.dec8Bit("c");
                },
                0x0E: function () {
                    _this.c = _this.memory.readByte(_this.pc);
                    _this.incPc();
                },
                0x0F: function () {
                    _this.rrc("a");
                },
            };
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
        Object.defineProperty(Z80.prototype, "alt_a", {
            get: function () {
                return this._alt_a;
            },
            set: function (n) {
                this._alt_a = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_f", {
            get: function () {
                return this._alt_f;
            },
            set: function (n) {
                this._alt_f = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_af", {
            get: function () {
                return (this.alt_a << 8) | (this.alt_f & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.alt_a = (n >> 8) & 0xFF;
                this.alt_f = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_h", {
            get: function () {
                return this._alt_h;
            },
            set: function (n) {
                this._alt_h = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_l", {
            get: function () {
                return this._alt_l;
            },
            set: function (n) {
                this._alt_l = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_hl", {
            get: function () {
                return (this.alt_h << 8) | (this.alt_l & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.alt_h = (n >> 8) & 0xFF;
                this.alt_l = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_b", {
            get: function () {
                return this._alt_b;
            },
            set: function (n) {
                this._alt_b = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_c", {
            get: function () {
                return this._alt_c;
            },
            set: function (n) {
                this._alt_c = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_bc", {
            get: function () {
                return (this.alt_b << 8) | (this.alt_c & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.alt_b = (n >> 8) & 0xFF;
                this.alt_c = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_d", {
            get: function () {
                return this._alt_d;
            },
            set: function (n) {
                this._alt_d = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_e", {
            get: function () {
                return this._alt_e;
            },
            set: function (n) {
                this._alt_e = n & 0xFF;
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
        Object.defineProperty(Z80.prototype, "alt_de", {
            get: function () {
                return (this.alt_d << 8) | (this.alt_e & 0xFF);
            },
            set: function (n) {
                n &= 0xFFFF;
                this.alt_d = (n >> 8) & 0xFF;
                this.alt_e = n & 0xFF;
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
            this.alt_af = 0;
            this.alt_bc = 0;
            this.alt_de = 0;
            this.alt_hl = 0;
            this.iff1 = false;
            this.iff2 = false;
            this.im = false;
            this.isHalted = false;
        };
        Z80.prototype.inc8Bit = function (reg) {
            this[reg]++;
            this.flag_h = ((this[reg] & 0x0F) === 0) ? 1 : 0;
            this.flag_z = (this[reg] === 0) ? 1 : 0;
            this.flag_n = 0;
        };
        Z80.prototype.dec8Bit = function (reg) {
            this[reg]--;
            this.flag_h = ((this[reg] & 0x0F) === 0x0F) ? 1 : 0;
            this.flag_z = (this[reg] === 0) ? 1 : 0;
            this.flag_n = 1;
        };
        Z80.prototype.inc16Bit = function (reg) {
            this[reg]++;
        };
        Z80.prototype.dec16Bit = function (reg) {
            this[reg]--;
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
        Z80.prototype.rlc = function (reg) {
            this.flag_c = this.getBit(this[reg], 7);
            this[reg] = ((this[reg] << 1) & 0xFF) | this.flag_c;
            this.flag_n = 0;
            this.flag_h = 0;
        };
        Z80.prototype.rrc = function (reg) {
            this.flag_c = this.getBit(this[reg], 0);
            this[reg] = (this[reg] >> 1) | (this.flag_c << 7);
            this.flag_h = 0;
            this.flag_n = 0;
        };
        Z80.prototype.incPc = function () {
            this.pc++;
        };
        Z80.prototype.inc2Pc = function () {
            this.pc += 2;
        };
        Z80.prototype.exafaf = function () {
            var temp = this.af;
            this.af = this.alt_af;
            this.alt_af = temp;
        };
        Z80.prototype.decodeInstruction = function (opcode) {
            this.tStates += this.OPCODE_T_STATES[opcode];
            return this.INSTRUCTIONS[opcode];
        };
        Z80.prototype.halted = function () {
            return this.isHalted;
        };
        Z80.prototype.executeInstruction = function () {
            var instruction = this.memory.readByte(this.pc);
            this.isHalted = false;
            this.incPc();
            this.decodeInstruction(instruction)();
        };
        Z80.prototype.TStates = function () {
            return this.tStates;
        };
        Z80.prototype.resetTStates = function () {
            this.tStates = 0;
        };
        return Z80;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Z80;
});
//# sourceMappingURL=Z80.js.map