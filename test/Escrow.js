const { expect } = require('chai');
const { ethers } = require('hardhat')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('MohitEscrow', () => {
    let buyer, seller, inspector, lender
    let realEstate, escrow

    console.log("RUNS Mohit");

    beforeEach(async() => {
        
        [buyer, seller, inspector, lender] = await ethers.getSigners()
        
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        let transaction = await realEstate.connect(seller).mint('https://resume-backend-production.up.railway.app/a98qWE9a8PH/g-d')
        await transaction.wait()
        
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

        // List property
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
    })
})