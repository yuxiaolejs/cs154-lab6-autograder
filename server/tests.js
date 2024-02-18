const fs = require("fs")
const child_process = require("child_process")

function genTest(length, addrRange = 10) {
    let output = []
    let addrIsBranch = {}
    for (let i = 0; i < length; i++) {
        let addr = Math.floor(Math.random() * addrRange) << 2
        addr = "0x" + addr.toString(16).padStart(8, "0")
        if (addrIsBranch[addr] === undefined) {
            addrIsBranch[addr] = (Math.random() > 0.3 ? "1" : "0")
        }
        let isBranch = addrIsBranch[addr]
        let isTaken = (isBranch && Math.random() > 0.5)
        output.push(`${addr}: ${isTaken ? 1 : 0} : ${isBranch}`)
    }
    return output.join("\n")
}

function oneBitTest(test) {
    let input = test.split("\n").map(x => x.split(":").map(x => x.trim())).filter(x => x.length === 3)
    let predictRegistor = [0]
    let count = 0
    let correct = 0

    let branches = []

    for (let i = 0; i < input.length; i++) {
        let addr = input[i][0]
        let isTaken = input[i][1] === "1"
        let isBranch = input[i][2] === "1"
        let predict = predictRegistor[0]
        if (isBranch) {
            count++
            if (predict === (isTaken ? 1 : 0)) {
                correct++
                branches.push(1)
            }
            else {
                branches.push(0)
            }
            predictRegistor[0] = isTaken ? 1 : 0
        }
    }
    return {
        branches,
        acc: correct / count
    }
}

function twoBitTest(test) {
    let input = test.split("\n").map(x => x.split(":").map(x => x.trim())).filter(x => x.length === 3)
    let predictRegistor = 0
    let count = 0
    let correct = 0

    let branches = []

    for (let i = 0; i < input.length; i++) {
        let addr = input[i][0]
        let isTaken = input[i][1] === "1"
        let isBranch = input[i][2] === "1"
        let predict = (predictRegistor & 0b10) >> 1
        if (isBranch) {
            count++
            if (predict === (isTaken ? 1 : 0)) {
                correct++
                branches.push(1)
            } else {
                branches.push(0)
            }
            if (isTaken) {
                if (predictRegistor < 3)
                    predictRegistor++
            } else {
                if (predictRegistor > 0)
                    predictRegistor--
            }
        }
    }
    return {
        branches,
        acc: correct / count
    }
}

function tableTest(test) {
    let input = test.split("\n").map(x => x.split(":").map(x => x.trim())).filter(x => x.length === 3)
    let count = 0
    let correct = 0
    let predictRegistors = [0, 0, 0, 0, 0, 0, 0, 0]

    let branches = []

    for (let i = 0; i < input.length; i++) {
        let addr = input[i][0]
        addr = (parseInt(addr, 16) >> 2) % 8
        let isTaken = input[i][1] === "1"
        let isBranch = input[i][2] === "1"


        let predict = (predictRegistors[addr] & 0b10) >> 1
        if (isBranch) {
            count++
            if (predict === (isTaken ? 1 : 0)) {
                correct++
                branches.push(1)
            } else {
                branches.push(0)
            }
            if (isTaken) {
                if (predictRegistors[addr] < 3)
                    predictRegistors[addr]++
            } else {
                if (predictRegistors[addr] > 0)
                    predictRegistors[addr]--
            }
        }
    }
    return {
        branches,
        acc: correct / count
    }
}

module.exports = {
    genTest,
    oneBitTest,
    twoBitTest,
    tableTest
}