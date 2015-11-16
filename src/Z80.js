/*!
 * Javascript Z80 Emulator
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// http://z80-heaven.wikidot.com/instructions-set
var Z80;
(function (Z80_1) {
    /**
     * Exception thrown under various CPU states that may need exception processing
     */
    var ProcessorException = (function (_super) {
        __extends(ProcessorException, _super);
        /**
         * Known exception for the Z80 emulator
         *
         * @param message Emulator exception message
         */
        function ProcessorException(message) {
            _super.call(this, message);
        }
        return ProcessorException;
    })(Error);
    /**
     * Z80 processor implementation
     */
    var Z80 = (function () {
        /**
         * Standard constructor. Set the processor up with a memory and I/O interface.
         *
         * @param memory Interface to the memory architecture
         * @param io Interface to the i/o port architecture
         */
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
                0, 4, 0, 4, 0, 11, 7, 0, 0, 0, 0, 0, 0, 4, 7, 0 // F0
            ];
            this.memory = memory;
            this.io = io;
            this.tStates = 0;
            this.reset();
        }
        Object.defineProperty(Z80.prototype, "pc", {
            /**
             * Get the value of the pc register
             *
             * @returns {number} pc - program counter
             */
            get: function () {
                return this._pc & 0xFFFF;
            },
            /**
             * Assign the pc register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._pc = n & 0xFFFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "sp", {
            /**
             * Get the value of the sp register
             *
             * @returns {number} sp - stack counter
             */
            get: function () {
                return this._sp;
            },
            /**
             * Assign the sp register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._sp = n & 0xFFFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "a", {
            /**
             * Get the value of the a register
             *
             * @returns {number} a
             */
            get: function () {
                return this._a;
            },
            /**
             * Assign the a register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
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
            /**
             * Get the value of the f register
             * Only the higher bits are used.
             * The lower bits are allways 0.
             * Ex: 1111 0000
             *
             * @returns {number} f
             */
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
            /**
             * Assign the f register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             *
             * @param {number} n - The value to assign
             */
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
            /**
             * Get the value of the af register
             *
             * @returns {number} af - The combined registers
             */
            get: function () {
                return (this.a << 8) | (this.f & 0xFF);
            },
            /**
             * Assign the af register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                n &= 0xFFFF;
                this.a = n >> 8;
                this.f = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "h", {
            /**
             * Get the value of the h register
             *
             * @returns {number} h
             */
            get: function () {
                return this._h;
            },
            /**
             * Assign the h register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._h = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "l", {
            /**
             * Get the value of the l register
             *
             * @returns {number} l
             */
            get: function () {
                return this._l;
            },
            /**
             * Assign the l register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._l = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "hl", {
            /**
             * Get the value of the hl register
             *
             * @returns {number} hl - The combined registers
             */
            get: function () {
                return (this.h << 8) | (this.l & 0xFF);
            },
            /**
             * Assign the hl register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                n &= 0xFFFF;
                this.h = (n >> 8) & 0xFF;
                this.l = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "b", {
            /**
             * Get the value of the b register
             *
             * @returns {number} b
             */
            get: function () {
                return this._b;
            },
            /**
             * Assign the b register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._b = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "c", {
            /**
             * Get the value of the c register
             *
             * @returns {number} c
             */
            get: function () {
                return this._c;
            },
            /**
             * Assign the c register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._c = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "bc", {
            /**
             * Get the value of the bc register
             *
             * @returns {number} bc - The combined registers
             */
            get: function () {
                return (this.b << 8) | (this.c & 0xFF);
            },
            /**
             * Assign the bc register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                n &= 0xFFFF;
                this.b = (n >> 8) & 0xFF;
                this.c = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "d", {
            /**
             * Get the value of the d register
             *
             * @returns {number} d
             */
            get: function () {
                return this._d;
            },
            /**
             * Assign the d register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._d = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "e", {
            /**
             * Get the value of the e register
             *
             * @returns {number} e
             */
            get: function () {
                return this._e;
            },
            /**
             * Assign the e register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._e = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "de", {
            /**
             * Get the value of the de register
             *
             * @returns {number} de - The combined registers
             */
            get: function () {
                return (this.d << 8) | (this.e & 0xFF);
            },
            /**
             * Assign the de register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                n &= 0xFFFF;
                this.d = (n >> 8) & 0xFF;
                this.e = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "i", {
            /**
             * Get the value of the i register
             *
             * @returns {number} i
             */
            get: function () {
                return this._i;
            },
            /**
             * Assign the i register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._i = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "r", {
            /**
             * Get the value of the r register
             *
             * @returns {number} r
             */
            get: function () {
                return this._e;
            },
            /**
             * Assign the r register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._r = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ir", {
            /**
             * Assign the ir register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                n &= 0xFFFF;
                this.i = (n >> 8) & 0xFF;
                this.r = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ixh", {
            /**
             * Get the value of the ixh register
             *
             * @returns {number} ixh
             */
            get: function () {
                return this._ixh;
            },
            /**
             * Assign the ixh register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._ixh = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ixl", {
            /**
             * Get the value of the ixl register
             *
             * @returns {number} ixl
             */
            get: function () {
                return this._ixl;
            },
            /**
             * Assign the ixl register.
             *
             * The value is masked with 0xFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                this._ixl = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Z80.prototype, "ix", {
            /**
             * Get the value of the ix register
             *
             * @returns {number} ix - The combined registers
             */
            get: function () {
                return (this._ixh << 8) | (this._ixl & 0xFF);
            },
            /**
             * Assign the ix register.
             *
             * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
             * @param {number} n - The value to assign
             */
            set: function (n) {
                n &= 0xFFFF;
                this.ixh = (n >> 8) & 0xFF;
                this.ixl = n & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Pop an operand from stack.
         * @private
         */
        Z80.prototype.pop = function () {
            var temp = this.memory.readWord(this.sp);
            this.sp += 2;
            return temp;
        };
        /**
         * Reset the processor to a known state. Equivalent to a hardware reset.
         */
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
            this._shadow_a = 0;
            this._shadow_f = 0;
            this.isHalted = false;
        };
        // Javascript does not have a preprocessor or a macro system.
        // So I am accessing with the alternative object syntax []
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
        /**
         * Test if the bit is set in the given number
         *
         * @param {number} x - The number
         * @param {number} bit - The bit
         */
        Z80.prototype.getBit = function (x, bit) {
            return x & (1 << bit);
        };
        /**
         * Execute all one byte instructions and pass multi-byte instructions on for further processing
         *
         * @param instruction Instruction byte
         */
        Z80.prototype.decodeInstruction = function (instruction) {
            this.tStates += this.OPCODE_T_STATES[instruction];
            switch (instruction) {
                // nop
                case 0x00:
                    break;
                // LD bc, nnnn
                case 0x01:
                    this.bc = this.memory.readWord(this.pc);
                    this.pc += 2;
                    break;
                // LD (BC), A
                case 0x02:
                    this.memory.writeByte(this.bc, this.a);
                    break;
                // inc BC
                case 0x03:
                    this.bc++;
                    break;
                // inc b
                case 0x04:
                    this.inc8Bit("b");
                    break;
                // dec b
                case 0x05:
                    this.dec8Bit("b");
                    break;
                // ld b,nn
                case 0x06:
                    this.b = this.memory.readByte(this.pc);
                    break;
                // RLCA
                case 0x07:
                    this.flag_c = this.getBit(this.a, 7);
                    this.a = ((this.a << 1) & 0xFF) | this.flag_c;
                    this.flag_n = 0;
                    this.flag_h = 0;
                    this.flag_z = 0;
                    break;
                // EX AF,AF'
                case 0x08:
                    var temp = this.a;
                    this.a = this.shadowA;
                    this.shadowA = temp;
                    temp = this.f;
                    this.f = this.shadowF;
                    this.shadowF = temp;
                    break;
                // ADD HL,BC
                case 0x09:
                    this.add16Bit("hl", "bc");
                    break;
                // LD A,(BC)
                case 0x0A:
                    this.a = this.memory.readByte(this.bc);
                    break;
                default:
                    throw new ProcessorException("Unknown Instruction");
            }
        };
        /**
         * Returns the state of the halt flag
         *
         * @return True if the processor has executed a HALT instruction
         */
        Z80.prototype.halted = function () {
            return this.isHalted;
        };
        /**
         * Execute a single instruction at the present program counter (PC) then return. The internal state of the processor
         * is updated along with the T state count.
         */
        Z80.prototype.executeInstruction = function () {
            this.isHalted = false;
            var instruction = this.memory.readByte(this.pc);
            this.pc++;
            try {
                this.decodeInstruction(instruction);
            }
            catch (e) {
                this.pc--;
            }
        };
        /**
         * Return the number of T states since last reset
         *
         * @return Processor T states
         */
        Z80.prototype.TStates = function () {
            return this.tStates;
        };
        /**
         * Reset the T state counter to zero
         */
        Z80.prototype.resetTStates = function () {
            this.tStates = 0;
        };
        return Z80;
    })();
    exports.default = Z80;
})(Z80 || (Z80 = {}));
//# sourceMappingURL=Z80.js.map