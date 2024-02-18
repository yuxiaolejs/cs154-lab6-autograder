import math
# import ucsbcs154lab6_2bitpred as p2b
# import ucsbcs154lab6_predtable as pt
import pyrtl
import sys
import json
# import requests
from urllib import request, parse


def getTestCases(path, testcases):
    url = 'http://127.0.0.1:13002'+path
    data = json.dumps(testcases).encode()
    req = request.Request(url, method='GET')
    response = request.urlopen(req)
    return json.loads(response.read())


def runTest(ttype='1bit', length=100):
    pyrtl.reset_working_block()
    
    if (ttype == '1bit'):
        import ucsbcs154lab6_1bitpred as p1b
    elif (ttype == '2bit'):
        import ucsbcs154lab6_2bitpred as p2b
    elif (ttype == 'table'):
        import ucsbcs154lab6_predtable as pt
    else:
        print("Invalid type")
        exit(1)

    tests = getTestCases('/testcase/'+ttype+"?length="+str(length), {})
    sim_trace = pyrtl.SimulationTrace()
    sim = pyrtl.Simulation(tracer=sim_trace)
    pcPrevious = 0
    branchTakenPrevious = 0
    isBranchPrevious = 0
    predictionPrevious = 0
    count = 0
    correct = 0
    # Edit this line to change the trace file you read from
    f = tests['input'].split("\n")
    
    branches = []
    
    for iteration, line in enumerate(f):  # Read through each line in the file
        pcCurrent = int(line[0:line.find(':')], 0)  # parse out current pc
        branchTakenCurrent = int(line[12])  # parse out branch taken
        # parse if the current instr is a branch
        isBranchCurrent = int(line[16])

        sim.step({  # Feed in input values
            'fetch_pc': pcCurrent,
            'update_branch_pc': pcPrevious,
            'update_prediction': isBranchPrevious,
            'update_branch_taken': branchTakenPrevious
        })

        # get the value of your prediction
        predictionCurrent = sim_trace.trace['pred_taken'][-1]

        if isBranchPrevious:  # check if previous instr was a branch
            if predictionPrevious == branchTakenPrevious:  # if prediction was correct
                correct += 1
                branches.append(1)
            else:
                branches.append(0)
            count += 1

        # Update for next cycle
        pcPrevious = pcCurrent
        branchTakenPrevious = branchTakenCurrent
        isBranchPrevious = isBranchCurrent
        predictionPrevious = predictionCurrent

    # one final check
    if isBranchPrevious:
        if predictionPrevious == branchTakenPrevious:
            correct += 1 # Correct prediction
            branches.append(1)
        else:
            branches.append(0)
        count += 1

    accuracy = correct/count

    if (math.fabs(accuracy - tests['output']['acc']) > 0.001 or branches != tests['output']['branches']):
        print("Failed")
        print("Expected: ", tests['output']['acc'])
        print("Got: ", accuracy)
        print("Branches         : ", branches)
        print("Expected Branches: ", tests['output']['branches'])
        print("TESTCASE:\n", tests['input'])
        exit(1)
    
    print("Passed")
    # print("Branches         : ", branches)
    # print("Expected Branches: ", tests['output']['branches'])


if __name__ == '__main__':
    print("Autograder for CS154 Lab 6 - Version 0.0.7")
    runTest("1bit", 1000)
    runTest("2bit", 1000)
    runTest("table", 50)
