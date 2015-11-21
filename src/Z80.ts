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

// http://z80-heaven.wikidot.com/instructions-set
// http://clrhome.org/table/

"use strict"

/**
 * Interface to describe the memory processor bus
 */
export interface Memory {
	/**
	 * Read a byte from memory
	 *
	 * @param {number} address The address to read from
	 * @return The byte read
	 */
	readByte(address: number): number;

	/**
	 * Read a 16 bit word from memory, LSB, MSB order
	 *
	 * @param {number} address The address to read from
	 * @return The word read
	 */
	readWord(address: number): number;

	/**
	 * Write a byte into memory
	 *
	 * @param {number} address The address to be written to
	 * @param {number} data The byte to be written
	 */
	writeByte(address: number, data: number);

	/**
	 * Write a 16 bit word into memory, LSB, MSB order.
	 *
	 * @param {number} address The address to be written to
	 * @param {number} data The word to be written
	 */
	writeWord(address: number, data: number);
}

/**
 * Interface to describe the I/O processor bus
 */
export interface IO {
	/**
	 * Read data from an I/O port
	 *
	 * @param address The port to be read from
	 * @return The 8 bit value at the request port address
	 */
	read(address: number): number;

	/**
	 * Write data to an I/O port
	 *
	 * @param address The port to be written to
	 * @param data The 8 bit value to be written
	 */
	write(address: number, data: number);
}

/**
 * Interface to the processor
 */
export interface CPU {
	/**
	 * Reset the processor to a known state. Equivalent to a hardware reset.
	 */
	reset();

	/**
	 * Returns the state of the halt flag
	 *
	 * @return True if the processor has executed a HALT instruction
	 */
	halted(): boolean;

	/**
	 * Execute a single instruction at the present program counter (PC) then return. The internal state of the processor
	 * is updated along with the T state count.
	 */
	executeInstruction();

	/**
	 * Return the number of T states since last reset
	 *
	 * @return Processor T states
	 */
	TStates(): number;

	/**
	 * Reset the T state counter to zero
	 */
	resetTStates();
}

/**
 * Internal interface for Instruction type.
 */
interface Instruction {
	(): void;
}

/**
 * Z80 processor implementation
 */
export default class Z80 implements CPU {
	// The memory processor bus
	private memory: Memory;

	// The I/O processor bus
	private io: IO;

	// A is also called the "accumulator". It is the primary register for arithmetic operations and accessing memory.
	private _a: number;

	// B is commonly used as an 8-bit counter.
	private _b: number;

	// C is used when you want to interface with hardware ports.
	private _c: number;

	// Shadow B register, Used to hold temporary data
	private _alt_b: number;

	// Shadow C register, Used to hold temporary data
	private _alt_c: number;

	// D is not normally used in its 8-bit form. Instead, it is used in conjuncture with E.
	private _d: number;

	// E is again, not used in its 8-bit form.
	private _e: number;

	// Shadow D register, Used to hold temporary data
	private _alt_d: number;

	// Shadow E register, Used to hold temporary data
	private _alt_e: number;

	// H is another register not normally used in 8-bit form.
	private _h: number;

	// L is yet another register not normally used in 8-bit form.
	private _l: number;

	// Shadow H register, Used to hold temporary data
	private _alt_h: number;

	// Shadow L register, Used to hold temporary data
	private _alt_l: number;
	
	// Shadow A register, Used to hold temporary data
	private _alt_a: number;

	// Shadow F register, Used to hold temporary data
	private _alt_f: number;

	// PC The program counter. It hold the point in memory that the processor is executing code from. No function can change PC except by actually jumping to a different location in memory.
	private _pc: number;

	// SP The stack pointer. It holds the current address of the top of the stack.
	private _sp: number;

	// I is the interrupt vector register. It is used by the calculator in the interrupt 2 mode.
	private _i: number;

	// R is the refresh register. Although it holds no specific purpose to the OS, it can be used to generate random numbers.
	private _r: number;

	// IXH The higher (first) byte of the IX register. Note that I is not the higher byte of IX. Combines with IXL to make the IX register.
	private _ixh: number;

	// IXL The lower (second) byte of the IX register. When combined with IXH these two registers make up the IX register.
	private _ixl: number;

	// IYH The higher (first) byte of the IY register. Note that I is not the higher byte of IY. Combines with IYL to make the IY register.
	private _iyh: number;

	// IYL The lower (second) byte of the IY register. When combined with IYH these two registers make up the IY register.
	private _iyl: number;

	// 7th bit Signed flag (S). Determines whether the accumulator ended up positive (1), or negative (0). This flag assumes that the accumulator is signed.
	private flag_s: number;

	// 6th bit Zero Flag (Z). Determines whether the accumulator is zero or not.
	private flag_z: number;

	// 5th bit The 5th bit of the last 8-bit instruction that altered flags.
	private flag_5: number;

	// 4th bit Half- carry(H).Is set when the least- significant nibble overflows.
	private flag_h: number;

	// 3th bit The 3rd bit of the last 8-bit instruction that altered flags.
	private flag_3: number;

	// 2nd bit Parity/Overflow (P/V). Either holds the results of parity or overflow. It's value depends on the instruction used. Is used for signed integers.
	private flag_pv: number;

	// 1st bit Add/Subtract (N). Determines what the last instruction used on the accumulator was. If it was add, the bit is reset (0). If it was subtract, the bit is set (1).
	private flag_n: number;

	// 0th bit Carry (C). Determines if there was an overflow or not. Note that it checks for unsigned values. The carry flag is also set if a subtraction results in a negative number.
	private flag_c: number;

	private tStates: number;

	private iff1: number;

	private iff2: number;

	private im: number;

	private isHalted: number;

	private OPCODE_T_STATES: number[] = [
		4, 10, 7,  6, 4,  4, 7, 4,  4, 11, 7,  6, 4, 4, 7, 4, // 00
		0, 10, 7,  6, 4,  4, 7, 4, 12, 11, 7,  6, 4, 4, 7, 4, // 10
		0, 10, 7,  6, 4,  4, 7, 4,  0, 11, 7,  6, 4, 4, 7, 4, // 20
		0, 10, 7,  6, 4,  4, 7, 4,  0, 11, 7,  6, 4, 4, 7, 4, // 30
		4,  4, 4,  4, 4,  4, 7, 4,  4,  4, 4,  4, 4, 4, 7, 4, // 40
		4,  4, 4,  4, 4,  4, 7, 4,  4,  4, 4,  4, 4, 4, 7, 4, // 50
		4,  4, 4,  4, 4,  4, 7, 4,  4,  4, 4,  4, 4, 4, 7, 4, // 60
		7,  7, 7,  7, 7,  7, 4, 7,  4,  4, 4,  4, 4, 4, 7, 4, // 70
		4,  4, 4,  4, 4,  4, 7, 4,  4,  4, 4,  4, 4, 4, 7, 4, // 80
		4,  4, 4,  4, 4,  4, 7, 4,  4,  4, 4,  4, 4, 4, 7, 4, // 90
		4,  4, 4,  4, 4,  4, 7, 4,  4,  4, 4,  4, 4, 4, 7, 4, // A0
		4,  4, 4,  4, 4,  4, 7, 4,  4,  4, 4,  4, 4, 4, 7, 4, // B0
		0, 10, 0,  0, 0, 11, 7, 0,  0,  0, 0,  0, 0, 0, 7, 0, // C0
		0, 10, 0, 11, 0, 11, 7, 0,  0,  4, 0, 11, 0, 4, 7, 0, // D0
		0, 10, 0, 19, 0, 11, 7, 0,  0,  4, 0,  4, 0, 0, 7, 0, // E0
		0, 10, 0,  4, 0, 11, 7, 0,  0,  0, 0,  0, 0, 4, 7, 0  // F0
	];

	private OPCODE_CB_STATES: number[] = [
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // 00
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // 10
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // 20
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // 30
		8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, // 40
		8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, // 50
		8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, // 60
		8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, // 70
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // 80
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // 90
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // A0
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // B0
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // C0
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // D0
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, // E0
		8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8  // F0
	];

	private INSTRUCTIONS: { [opcode: number]: Instruction; } = {
		// NOP
		0x00: () => {},
		// LD BC,X
		0x01: () => {
			this.bc = this.memory.readWord(this.pc);
			this.inc2Pc();
		},
		// LD (BC), A
		0x02: () => {
			this.memory.writeByte(this.bc, this.a);
		},
		// INC BC
		0x03: () => {
			this.inc16Bit("bc");
		},
		// INC B
		0x04: () => {
			this.inc8Bit("b");
		},
		// DEC B
		0x05: () => {
			this.dec8Bit("b");
		},
		// LD B,X
		0x06: () => {
			this.b = this.memory.readByte(this.pc);
			this.incPc();
		},
		// RLCA
		0x07: () => {
			this.rlc("a");
		},
		// EX AF,AF'
		0x08: () => {
			this.exafaf();
		},
		// ADD HL,BC
		0x09: () => {
			this.add16Bit("bc");
		},
		// LD A,(BC)
		0x0A: () => {
			this.a = this.memory.readByte(this.bc);
		},
		// DEC BC
		0x0B: () => {
			this.dec16Bit("bc");
		},
		// INC C
		0x0C: () => {
			this.inc8Bit("c");
		},
		// DEC C
		0x0D: () => {
			this.dec8Bit("c");
		},
		// LD C,X
		0x0E: () => {
			this.c = this.memory.readByte(this.pc);
			this.incPc();
		},
		// RRCA
		0x0F: () => {
			this.rrc("a");
		},
	};

	/**
	 * Standard constructor. Set the processor up with a memory and I/O interface.
	 *
	 * @param memory Interface to the memory architecture
	 * @param io Interface to the i/o port architecture
	 */
	constructor(memory: Memory, io: IO) {
		this.memory = memory;
		this.io = io;

		this.tStates = 0;

		this.reset();
	}

	/**
	 * Get the value of the pc register
	 *
	 * @returns {number} pc - program counter
	 */
	get pc(): number {
		return this._pc & 0xFFFF;
	}

	/**
	 * Assign the pc register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set pc(n: number) {
		this._pc = n & 0xFFFF;
	}

	/**
	 * Get the value of the sp register
	 *
	 * @returns {number} sp - stack counter
	 */
	get sp(): number {
		return this._sp;
	}

	/**
	 * Assign the sp register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set sp(n: number) {
		this._sp = n & 0xFFFF;
	}

	/**
	 * Get the value of the a register
	 *
	 * @returns {number} a
	 */
	get a(): number {
		return this._a;
	}

	/**
	 * Assign the a register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set a(n: number) {
		this._a = n & 0xFF;
	}

	/**
	 * Get the value of the alt_a register
	 *
	 * @returns {number} alt_a
	 */
	get alt_a(): number {
		return this._alt_a;
	}

	/**
	 * Assign the alt_a register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_a(n: number) {
		this._alt_a = n & 0xFF;
	}

	/**
	 * Get the value of the f register
	 * Only the higher bits are used.
	 * The lower bits are allways 0.
	 * Ex: 1111 0000
	 *
	 * @returns {number} f
	 */
	get f(): number {
		return (
			(this.flag_s  << 7) |
			(this.flag_z  << 6) |
			(this.flag_5  << 5) |
			(this.flag_h  << 4) |
			(this.flag_3  << 3) |
			(this.flag_pv << 2) |
			(this.flag_n  << 1) |
			(this.flag_c  << 0)
		);
	}

	/**
	 * Assign the f register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 *
	 * @param {number} n - The value to assign
	 */
	set f(n: number) {
		n &= 0xFF;
		this.flag_s  = (n & 0x80) >> 7;
		this.flag_z =  (n & 0x40) >> 6;
		this.flag_5 =  (n & 0x20) >> 5;
		this.flag_h =  (n & 0x10) >> 4;
		this.flag_3 =  (n & 0x08) >> 3;
		this.flag_pv = (n & 0x04) >> 2;
		this.flag_n =  (n & 0x02) >> 1;
		this.flag_c =  (n & 0x01) >> 0;
	}

	/**
	 * Get the value of the alt_f register
	 *
	 * @returns {number} alt_f
	 */
	get alt_f(): number {
		return this._alt_f;
	}

	/**
	 * Assign the alt_f register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_f(n: number) {
		this._alt_f = n & 0xFF;
	}

	/**
	 * Get the value of the af register
	 *
	 * @returns {number} af - The combined registers
	 */
	get af(): number {
		return (this.a << 8) | (this.f & 0xFF);
	}

	/**
	 * Assign the af register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set af(n: number) {
		n &= 0xFFFF;

		this.a = n >> 8;
		this.f = n & 0xFF;
	}

	/**
	 * Get the value of the alt_af register
	 *
	 * @returns {number} alt_af - The combined registers
	 */
	get alt_af(): number {
		return (this.alt_a << 8) | (this.alt_f & 0xFF);
	}

	/**
	 * Assign the alt_af register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_af(n: number) {
		n &= 0xFFFF;

		this.alt_a = (n >> 8) & 0xFF;
		this.alt_f = n & 0xFF;
	}

	/**
	 * Get the value of the h register
	 *
	 * @returns {number} h
	 */
	get h(): number {
		return this._h;
	}

	/**
	 * Assign the h register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set h(n: number) {
		this._h = n & 0xFF;
	}

	/**
	 * Get the value of the alt_h register
	 *
	 * @returns {number} alt_h
	 */
	get alt_h(): number {
		return this._alt_h;
	}

	/**
	 * Assign the alt_h register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_h(n: number) {
		this._alt_h = n & 0xFF;
	}

	/**
	 * Get the value of the l register
	 *
	 * @returns {number} l
	 */
	get l(): number {
		return this._l;
	}

	/**
	 * Assign the l register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set l(n: number) {
		this._l = n & 0xFF;
	}

	/**
	 * Get the value of the alt_l register
	 *
	 * @returns {number} alt_l
	 */
	get alt_l(): number {
		return this._alt_l;
	}

	/**
	 * Assign the alt_l register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_l(n: number) {
		this._alt_l = n & 0xFF;
	}

	/**
	 * Get the value of the hl register
	 *
	 * @returns {number} hl - The combined registers
	 */
	get hl(): number {
		return (this.h << 8) | (this.l & 0xFF);
	}

	/**
	 * Assign the hl register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set hl(n: number) {
		n &= 0xFFFF;

		this.h = (n >> 8) & 0xFF;
		this.l = n & 0xFF;
	}

	/**
	 * Get the value of the alt_hl register
	 *
	 * @returns {number} alt_hl - The combined registers
	 */
	get alt_hl(): number {
		return (this.alt_h << 8) | (this.alt_l & 0xFF);
	}

	/**
	 * Assign the alt_hl register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_hl(n: number) {
		n &= 0xFFFF;

		this.alt_h = (n >> 8) & 0xFF;
		this.alt_l = n & 0xFF;
	}

	/**
	 * Get the value of the b register
	 *
	 * @returns {number} b
	 */
	get b(): number {
		return this._b;
	}

	/**
	 * Assign the b register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set b(n: number) {
		this._b = n & 0xFF;
	}

	/**
	 * Get the value of the alt_b register
	 *
	 * @returns {number} alt_b
	 */
	get alt_b(): number {
		return this._alt_b;
	}

	/**
	 * Assign the alt_b register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_b(n: number) {
		this._alt_b = n & 0xFF;
	}

	/**
	 * Get the value of the c register
	 *
	 * @returns {number} c
	 */
	get c(): number {
		return this._c;
	}

	/**
	 * Assign the c register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set c(n: number) {
		this._c = n & 0xFF;
	}

	get alt_c(): number {
		return this._alt_c;
	}

	/**
	 * Assign the alt_c register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_c(n: number) {
		this._alt_c = n & 0xFF;
	}

	/**
	 * Get the value of the bc register
	 *
	 * @returns {number} bc - The combined registers
	 */
	get bc(): number {
		return (this.b << 8) | (this.c & 0xFF);
	}

	/**
	 * Assign the bc register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set bc(n: number) {
		n &= 0xFFFF;

		this.b = (n >> 8) & 0xFF;
		this.c = n & 0xFF;
	}

	/**
	 * Get the value of the alt_bc register
	 *
	 * @returns {number} alt_bc - The combined registers
	 */
	get alt_bc(): number {
		return (this.alt_b << 8) | (this.alt_c & 0xFF);
	}

	/**
	 * Assign the alt_bc register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_bc(n: number) {
		n &= 0xFFFF;

		this.alt_b = (n >> 8) & 0xFF;
		this.alt_c = n & 0xFF;
	}

	/**
	 * Get the value of the d register
	 *
	 * @returns {number} d
	 */
	get d(): number {
		return this._d;
	}

	/**
	 * Assign the d register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set d(n: number) {
		this._d = n & 0xFF;
	}

	/**
	 * Get the value of the alt_d register
	 *
	 * @returns {number} alt_d
	 */
	get alt_d(): number {
		return this._alt_d;
	}

	/**
	 * Assign the alt_d register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_d(n: number) {
		this._alt_d = n & 0xFF;
	}

	/**
	 * Get the value of the e register
	 *
	 * @returns {number} e
	 */
	get e(): number {
		return this._e;
	}

	/**
	 * Assign the e register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set e(n: number) {
		this._e = n & 0xFF;
	}

	/**
	 * Get the value of the alt_e register
	 *
	 * @returns {number} alt_e
	 */
	get alt_e(): number {
		return this._alt_e;
	}

	/**
	 * Assign the alt_e register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_e(n: number) {
		this._alt_e = n & 0xFF;
	}

	/**
	 * Get the value of the de register
	 *
	 * @returns {number} de - The combined registers
	 */
	get de(): number {
		return (this.d << 8) | (this.e & 0xFF);
	}

	/**
	 * Assign the de register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set de(n: number) {
		n &= 0xFFFF;

		this.d = (n >> 8) & 0xFF;
		this.e = n & 0xFF;
	}

	/**
	 * Get the value of the alt_de register
	 *
	 * @returns {number} alt_de - The combined registers
	 */
	get alt_de(): number {
		return (this.alt_d << 8) | (this.alt_e & 0xFF);
	}

	/**
	 * Assign the alt_de register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set alt_de(n: number) {
		n &= 0xFFFF;

		this.alt_d = (n >> 8) & 0xFF;
		this.alt_e = n & 0xFF;
	}

	/**
	 * Get the value of the i register
	 *
	 * @returns {number} i
	 */
	get i(): number {
		return this._i;
	}

	/**
	 * Assign the i register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set i(n: number) {
		this._i = n & 0xFF;
	}

	/**
	 * Get the value of the r register
	 *
	 * @returns {number} r
	 */
	get r(): number {
		return this._r;
	}

	/**
	 * Assign the r register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set r(n: number) {
		this._r = n & 0xFF;
	}

	/**
	 * The highest bit (bit 7) of the R register
	 *
	 * @returns {number} bit 7 of R
	 */
	get r7(): number {
		return (this._r & 0x80) >> 7;
	}

	/**
	 * The highest bit (bit 7) of the R register
	 *
	 * @param {number} n - The value to assign 0 | 1
	 */
	set r7(n: number) {
		this._r = (n << 7) | (this._r & 0x7F);
	}

	/**
	 * Assign the ir register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set ir(n: number) {
		n &= 0xFFFF;

		this.i = (n >> 8) & 0xFF;
		this.r = n & 0xFF;
	}

	/**
	 * Get the value of the ixh register
	 *
	 * @returns {number} ixh
	 */
	get ixh(): number {
		return this._ixh;
	}

	/**
	 * Assign the ixh register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set ixh(n: number) {
		this._ixh = n & 0xFF;
	}

	/**
	 * Get the value of the ixl register
	 *
	 * @returns {number} ixl
	 */
	get ixl(): number {
		return this._ixl;
	}

	/**
	 * Assign the ixl register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set ixl(n: number) {
		this._ixl = n & 0xFF;
	}

	/**
	 * Get the value of the ix register
	 *
	 * @returns {number} ix - The combined registers
	 */
	get ix(): number {
		return (this._ixh << 8) | (this._ixl & 0xFF);
	}

	/**
	 * Assign the ix register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set ix(n: number) {
		n &= 0xFFFF;

		this.ixh = (n >> 8) & 0xFF;
		this.ixl = n & 0xFF;
	}

	/**
	 * Get the value of the iyh register
	 *
	 * @returns {number} iyh
	 */
	get iyh(): number {
		return this._iyh;
	}

	/**
	 * Assign the iyh register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set iyh(n: number) {
		this._iyh = n & 0xFF;
	}

	/**
	 * Get the value of the iyl register
	 *
	 * @returns {number} iyl
	 */
	get iyl(): number {
		return this._iyl;
	}

	/**
	 * Assign the iyl register.
	 *
	 * The value is masked with 0xFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set iyl(n: number) {
		this._iyl = n & 0xFF;
	}

	/**
	 * Get the value of the iy register
	 *
	 * @returns {number} iy - The combined registers
	 */
	get iy(): number {
		return (this._iyh << 8) | (this._iyl & 0xFF);
	}

	/**
	 * Assign the iy register.
	 *
	 * The value is masked with 0xFFFF, so I can make sure thet it does not overflow.
	 * @param {number} n - The value to assign
	 */
	set iy(n: number) {
		n &= 0xFFFF;

		this.iyh = (n >> 8) & 0xFF;
		this.iyl = n & 0xFF;
	}

	/**
	 * Pop an operand from stack.
	 * @returns {number} Value from stack
	 */
	pop(): number {
		let temp: number = this.memory.readWord(this.sp);
		this.sp += 2;

		return temp;
	}

	/**
	 * Reset the processor to a known state. Equivalent to a hardware reset.
	 */
	reset() {
		this.af = 0;
		this.bc = 0;
		this.de = 0;
		this.pc = 0;
		this.sp = 0;
		this.i  = 0;
		this.r  = 0;
		this.ix = 0;
		this.iy = 0;

		this.alt_af = 0;
		this.alt_bc = 0;
		this.alt_de = 0;
		this.alt_hl = 0;

		this.iff1 = 0;
		this.iff2 = 0;
		this.im = 0;

		this.isHalted = 0;
	}

	/**
	 * inc8Bit increment an 8bit register
	 * @param {string} reg - The register name
	 */
	private inc8Bit(reg: string) {
		this[reg]++;

		this.flag_s = (this[reg] > 0) ? 1 : 0;
		this.flag_z = (this[reg] === 0) ? 1 : 0;
		this.flag_h = ((this[reg] & 0x0F) === 0) ? 1 : 0;

		this.flag_pv = (this[reg] === 0x80) ? 1 : 0;
		
		this.flag_n = 0;
	}

	/**
	 * dec8Bit decrement an 8bit register
	 * @param {string} reg - The register name
	 */
	private dec8Bit(reg: string) {
		this[reg]--;

		this.flag_s = (this[reg] > 0) ? 1 : 0;
		this.flag_z = (this[reg] === 0) ? 1 : 0;
		this.flag_5 = this.getBit(this[reg], 5);
		this.flag_h = ((this[reg] & 0x0F) === 0x0F) ? 1 : 0;
		this.flag_3 = this.getBit(this[reg], 3);

		this.flag_pv = (this[reg] === 0x80) ? 1 : 0;

		this.flag_n = 1;
	}

	/**
	 * inc16Bit decrement an 16bit register
	 * @param {string} reg - The register name
	 */
	private inc16Bit(reg: string) {
		this[reg]++;
	}

	/**
	 * dec16Bit decrement an 16bit register
	 * @param {string} reg - The register name
	 */
	private dec16Bit(reg: string) {
		this[reg]--;
	}

	/**
	 * add16Bit adds two registers and update the flags
	 *
	 * @param {string} reg - Register name
	 */
	private add16Bit(reg: string) {
		this.hl += this[reg];
		this.flag_n = 0;

		this.flag_h = ((this.hl & 0xFFF) + (this[reg] & 0xFFF) > 0xFFF) ? 1 : 0;
		this.flag_c = (this.hl + this[reg] > 0xFFFF) ? 1 : 0;
	}

	/**
	 * Test if the bit is set in the given number
	 *
	 * @param {number} x - The number
	 * @param {number} bit - The bit
	 */
	private getBit(x: number, bit: number): number {
		return (x & (1 << bit - 1)) > 0 ? 1 : 0;
	}

	/**
	 * 8-bit rotation to the left. The bit leaving on the left is copied into the carry, and to bit 0.
	 *
	 * @param {string} reg - Register name
	 */
	private rlc(reg: string) {
		this.flag_c = this.getBit(this[reg], 8);
		this[reg] = ((this[reg] << 1) & 0xFF) | this.flag_c;
		this.flag_n = 0;
		this.flag_h = 0;
	}

	/**
	 * 8-bit rotation to the right. the bit leaving on the right is copied into the carry, and into bit 7.
	 *
	 * @param {string} reg - Register name
	 */
	private rrc(reg: string) {
		this.flag_c = this.getBit(this[reg], 0);
		this[reg] = (this[reg] >> 1) | (this.flag_c << 7);

		this.flag_h = 0;
		this.flag_n = 0;
	}

	/**
	 * Increment the pc register.
	 */
	private incPc() {
		this.pc++;
	}

	/**
	 * Increment the pc register.
	 */
	private inc2Pc() {
		this.pc += 2
	}

	/**
	 * Exchanges two 16-bit values.
	 */
	private exafaf() {
		let temp = this.af;
		this.af = this.alt_af;
		this.alt_af = temp;
	}

	/**
	 * Decode one byte instructions and pass multi-byte instructions on for further processing
	 *
	 * @param {number} opcode - Instruction byte
	 * @returns {Instruction} instruction
	 */
	private decodeInstruction(opcode: number): Instruction {
		this.tStates += this.OPCODE_T_STATES[opcode];

		return this.INSTRUCTIONS[opcode];
	}

	/**
	 * Returns the state of the halt flag
	 *
	 * @return {boolean} True if the processor has executed a HALT instruction
	 */
	halted(): boolean {
		return this.isHalted === 1;
	}

	/**
	 * Execute a single instruction at the present program counter (PC) then return. The internal state of the processor
	 * is updated along with the T state count.
	 */
	executeInstruction() {
		let opcode: number = this.memory.readByte(this.pc);
		this.r = (this.r + 1) & 0x7F;
		this.incPc();
		this.decodeInstruction(opcode)();
	}

	/**
	 * Return the number of T states since last reset
	 *
	 * @return {number} Processor T states
	 */
	TStates(): number {
		return this.tStates;
	}

	/**
	 * Reset the T state counter to zero
	 */
	resetTStates() {
		this.tStates = 0;
	}
}
