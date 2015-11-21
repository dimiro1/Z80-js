module.exports = {
    "00": {
        "input": {
            "registers": {
                "af": 0x0000,
                "bc": 0x0000,
                "de": 0x0000,
                "hl": 0x0000,
                "alt_af": 0x0000,
                "alt_bc": 0x0000,
                "alt_de": 0x0000,
                "alt_hl": 0x0000,
                "ix": 0x0000,
                "iy": 0x0000,
                "sp": 0x0000,
                "pc": 0x0000,

                "i": 0x00,
                "r": 0x00,
                "iff1": false,
                "iff2": false,
                "im": false,
                "isHalted": false,

                "event": 1
            },
            "memory": {
                "start": 0x0000,
                "data": [0x00]
            }
        },
        "expected": {
            "af": 0x0000,
            "bc": 0x0000,
            "de": 0x0000,
            "hl": 0x0000,
            "alt_af": 0x0000,
            "alt_bc": 0x0000,
            "alt_de": 0x0000,
            "alt_hl": 0x0000,
            "ix": 0x0000,
            "iy": 0x0000,
            "sp": 0x0000,
            "pc": 0x0001,

            "i": 0x00,
            "r": 0x01,
            "iff1": false,
            "iff2": false,
            "im": false,
            "isHalted": false,
            "tStates": 4
        }
    }
}