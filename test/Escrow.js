const { expect } = require('chai');
const { ethers } = require('hardhat')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('MohitEscrow', () => {
    let buyer, seller, inspector, lender
    let realEstate, escrow

    beforeEach(async() => {
        
        //ethers.getSigners returning 10 Ethereum sample accounts, and we are destructuring and setting those values from 0-4 to buyer, seller, inspector, lender
        [buyer, seller, inspector, lender] = await ethers.getSigners()
        
        // Getting 'RealEstate' contract from the file which we created and deploying it.
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        // from deployed 'realEstate' contract we are connecting seller to it and minting a NFT
        let transaction = await realEstate.connect(seller).mint('https://resume-backend-production.up.railway.app/a98qWE9a8PH/g-d')
        await transaction.wait()
        
        // Getting 'Escrow' contract from the file 'Escrow.sol' which we created and deploying it with required value from that file
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )
        
        // Approve property (Before Transfering NFT or Listing Property we have to approve it first)
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // List property for running Test Cases
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe('Deployment', () => {
        it('Returns NFT Address', async () => {
            const result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address)
            console.log(result);
        })
        it('Returns Seller', async() => {
            const result = await escrow.seller();
            expect(result).to.be.equal(seller.address)
        })
        it('Returns Inspector', async() => {
            const result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address)
        })
        it('Returns Lender', async() => {
            const result = await escrow.lender();
            expect(result).to.be.equal(lender.address)
        })
    })

    describe('Listing', () => {
        it('Updates as Listed', async () => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })
        it('Update Ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
        it('Returns Buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })
        it('Returns Purchase price', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })
        it('Returns Escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })
    })
    
    describe('Deposits', () => {
        it('Update contract balance', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)})
            await transaction.wait()

            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        } )
    })
    describe('Inspection', () => {
        it('Update inspection balance', async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            const result = await escrow.inspectionStatus(1)
            expect(result).to.be.equal(true)
        } )
    })
    describe('Approval', () => {
        it('Updates approval status', async () => {
            let transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait()

            expect(await escrow.approval(1, buyer.address)).to.be.equal(true);
            expect(await escrow.approval(1, seller.address)).to.be.equal(true);
            expect(await escrow.approval(1, lender.address)).to.be.equal(true);
        })
    })
    describe('Sale', async () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)})
            await transaction.wait();

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait();

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait();

            await lender.sendTransaction({to: escrow.address, value: tokens(5)});

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait();
        })
        it('Update ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
            
        })
        // it('Update balance', async () => {
        //     expect(await escrow.getBalance()).to.be.equal(0);
        // })
    })
})