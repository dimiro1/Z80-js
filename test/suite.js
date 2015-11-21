var tests = {
    "00": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x00]
        },
        "output": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "01": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x01, 0x12, 0x34]
        },
        "output": {
            "regs": [0x0000, 0x3412, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0003, 0x00, 0x01, 0, 0, 0, 0, 10],
            "mem": []
        }
    },

    "02": {
        "input": {
            "regs": [0x5600, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x02]
        },
        "output": {
            "regs": [0x5600, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 7],
            "mem": [0x0001, 0x56]
        }
    },

    "03": {
        "input": {
            "regs": [0x0000, 0x789a, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x03]
        },
        "output": {
            "regs": [0x0000, 0x789b, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 6],
            "mem": []
        }
    },

    "04": {
        "input": {
            "registers": {
                "af": 0x0000, "bc": 0xff00, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0000,

                "i": 0x00, "r": 0x00,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,

                "event": 1
            },
            "memory": {
                "start": 0x0000,
                "data": [0x04]
            }
        },
        "expected": {
            "registers": {
                "af": 0x0050, "bc": 0x0000, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0001,

                "i": 0x00, "r": 0x01,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,
                "tStates": 4
            },
            "memory": {
                "start": 0x0000,
                "data": []
            }
        }
    },

    "05": {
        "input": {
            "registers": {
                "af": 0x0000, "bc": 0x0000, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0000,

                "i": 0x00, "r": 0x00,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,

                "event": 1
            },
            "memory": {
                "start": 0x0000,
                "data": [0x05]
            }
        },
        "expected": {
            "registers": {
                "af": 0x00ba, "bc": 0xff00, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0001,

                "i": 0x00, "r": 0x01,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,
                "tStates": 7
            },
            "memory": {
                "start": 0x0000,
                "data": []
            }
        }
    },

    "06": {
        "input": {
            "registers": {
                "af": 0x0000, "bc": 0x0000, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0000,

                "i": 0x00, "r": 0x00,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,

                "event": 1
            },
            "memory": {
                "start": 0x0000,
                "data": [0x06, 0xbc]
            }
        },
        "expected": {
            "registers": {
                "af": 0x0000, "bc": 0xbc00, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0002,

                "i": 0x00, "r": 0x01,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,
                "tStates": 7
            },
            "memory": {
                "start": 0x0000,
                "data": []
            }
        }
    },

    "07": {
        "input": {
            "registers": {
                "af": 0x8800, "bc": 0x0000, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0000,

                "i": 0x00, "r": 0x00,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,

                "event": 1
            },
            "memory": {
                "start": 0x0000,
                "data": [0x07]
            }
        },
        "expected": {
            "registers": {
                "af": 0x1101, "bc": 0x0000, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x0000, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0001,

                "i": 0x00, "r": 0x01,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,
                "tStates": 4
            },
            "memory": {
                "start": 0x0000,
                "data": []
            }
        }
    },

    "08": {
        "input": {
            "registers": {
                "af": 0xdef0, "bc": 0x0000, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0x1234, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0000,

                "i": 0x00, "r": 0x00,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,

                "event": 1
            },
            "memory": {
                "start": 0x0000,
                "data": [0x08]
            }
        },
        "expected": {
            "registers": {
                "af": 0x1234, "bc": 0x0000, "de": 0x0000, "hl": 0x0000,
                "alt_af": 0xdef0, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0001,

                "i": 0x00, "r": 0x01,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,
                "tStates": 4
            },
            "memory": {
                "start": 0x0000,
                "data": []
            }
        }
    },

    "09": {
        "input": {
            "registers": {
                "af": 0xdef0, "bc": 0x5678, "de": 0x0000, "hl": 0x9abc,
                "alt_af": 0x1234, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0000,

                "i": 0x00, "r": 0x00,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,

                "event": 1
            },
            "memory": {
                "start": 0x0000,
                "data": [0x09]
            }
        },
        "expected": {
            "registers": {
                "af": 0x0030, "bc": 0x5678, "de": 0x0000, "hl": 0xf134,
                "alt_af": 0xdef0, "alt_bc": 0x0000, "alt_de": 0x0000, "alt_hl": 0x0000,
                "ix": 0x0000, "iy": 0x0000, "sp": 0x0000, "pc": 0x0001,

                "i": 0x00, "r": 0x01,
                "iff1": false, "iff2": false, "im": false, "isHalted": false,
                "tStates": 11
            },
            "memory": {
                "start": 0x0000,
                "data": []
            }
        }
    }
};

module.exports.get = (key) => {
    return tests[key];
}