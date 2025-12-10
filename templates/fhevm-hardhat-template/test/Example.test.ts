import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("Example", function () {
    let contract: any;
    let owner: Signer;
    let user1: Signer;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        const Example = await ethers.getContractFactory("Example");
        contract = await Example.deploy();
        await contract.waitForDeployment();
    });

    describe("Deployment", function () {
        it("should deploy successfully", async function () {
            const address = await contract.getAddress();
            expect(address).to.be.properAddress;
        });
    });

    describe("Store Value", function () {
        it("should allow storing encrypted value", async function () {
            // Note: In real tests with FHEVM, you would:
            // 1. Create encrypted input using fhevm.createEncryptedInput()
            // 2. Add the value: input.add32(42)
            // 3. Generate proof: await input.encrypt()
            // 4. Pass to storeValue()
            //
            // const input = await fhevm.createEncryptedInput(
            //     await contract.getAddress(),
            //     await owner.getAddress()
            // );
            // input.add32(42);
            // const encrypted = await input.encrypt();
            //
            // await expect(
            //     contract.storeValue(encrypted.handles[0], encrypted.inputProof)
            // ).to.not.be.reverted;
        });

        it("should emit ValueUpdated event", async function () {
            // const encrypted = /* create encrypted value */;
            // await expect(contract.storeValue(encrypted.handles[0], encrypted.inputProof))
            //     .to.emit(contract, "ValueUpdated")
            //     .withArgs(await owner.getAddress());
        });
    });

    describe("Get Value", function () {
        it("should return encrypted value", async function () {
            // Store value first
            // const encrypted = /* create encrypted 42 */;
            // await contract.storeValue(...);
            //
            // Retrieve it
            // const result = await contract.getValue();
            // expect(result).to.not.be.undefined;
        });
    });
});
