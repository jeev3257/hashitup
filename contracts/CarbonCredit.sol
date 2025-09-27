// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonCredit
 * @dev ERC-20 token for Carbon Credit management system
 * @notice This contract manages carbon credit tokens with per-company caps and time-based restrictions
 */
contract CarbonCredit is ERC20, Ownable, ReentrancyGuard {
    
    // Token symbol and name are set in constructor via ERC20
    
    // Maximum tokens that can be minted per company
    uint256 public capPerCompany;
    
    // Track minted amounts per company address
    mapping(address => uint256) public mintedPerCompany;
    
    // Track company registration status
    mapping(address => bool) public isRegisteredCompany;
    
    // Track last mint timestamp per company (for future 5-minute restriction)
    mapping(address => uint256) public lastMintTime;
    
    // Grace period for minting (5 minutes = 300 seconds)
    uint256 public constant MINT_COOLDOWN = 300; // 5 minutes
    
    // Events for immutable blockchain logging
    event CompanyRegistered(address indexed company, uint256 timestamp);
    event TokensMinted(address indexed company, uint256 amount, uint256 timestamp);
    event CapUpdated(uint256 oldCap, uint256 newCap);
    event ComplianceCheck(address indexed company, uint256 emissionValue, uint256 emissionCap, string action, uint256 timestamp);
    event ComplianceMint(address indexed company, uint256 amount, uint256 newBalance, uint256 timestamp);
    event ComplianceDeduct(address indexed company, uint256 amount, uint256 newBalance, uint256 timestamp);
    event CreditPurchase(address indexed company, uint256 amount, uint256 newBalance, uint256 timestamp);
    event CompanyFlagged(address indexed company, uint256 requiredAmount, uint256 availableAmount, uint256 timestamp);
    event BuyTimerStarted(address indexed company, uint256 endTime, uint256 requiredAmount, uint256 timestamp);
    
    /**
     * @dev Constructor sets the carbon credit cap per company
     * @param _capPerCompany Maximum tokens each company can receive
     */
    constructor(uint256 _capPerCompany) ERC20("CarbonCredit", "CC") Ownable(msg.sender) {
        require(_capPerCompany > 0, "Cap must be greater than 0");
        capPerCompany = _capPerCompany;
        
        emit CapUpdated(0, _capPerCompany);
    }
    
    /**
     * @dev Register a company for carbon credit eligibility
     * @param company Address of the company to register
     */
    function registerCompany(address company) external onlyOwner {
        require(company != address(0), "Invalid company address");
        require(!isRegisteredCompany[company], "Company already registered");
        
        isRegisteredCompany[company] = true;
        emit CompanyRegistered(company, block.timestamp);
    }
    
    /**
     * @dev Mint carbon credit tokens to a registered company
     * @param to Company address to mint tokens to
     * @param amount Number of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(isRegisteredCompany[to], "Company not registered");
        
        // Check if minting would exceed company cap
        require(
            mintedPerCompany[to] + amount <= capPerCompany,
            "Exceeds company cap limit"
        );
        
        // Future enhancement: 5-minute cooldown check
        // Uncomment below for time-based restrictions
        /*
        require(
            block.timestamp >= lastMintTime[to] + MINT_COOLDOWN,
            "Mint cooldown period not met"
        );
        */
        
        // Update tracking
        mintedPerCompany[to] += amount;
        lastMintTime[to] = block.timestamp;
        
        // Mint tokens
        _mint(to, amount);
        
        emit TokensMinted(to, amount, block.timestamp);
    }
    
    /**
     * @dev Update the cap per company (admin only)
     * @param newCap New maximum tokens per company
     */
    function updateCapPerCompany(uint256 newCap) external onlyOwner {
        require(newCap > 0, "New cap must be greater than 0");
        
        uint256 oldCap = capPerCompany;
        capPerCompany = newCap;
        
        emit CapUpdated(oldCap, newCap);
    }
    
    /**
     * @dev Get remaining mintable tokens for a company
     * @param company Company address to check
     * @return Remaining tokens that can be minted
     */
    function getRemainingCap(address company) external view returns (uint256) {
        if (!isRegisteredCompany[company]) {
            return 0;
        }
        return capPerCompany - mintedPerCompany[company];
    }
    
    /**
     * @dev Check if a company can mint tokens (considering cooldown)
     * @param company Company address to check
     * @return canMint Whether company can mint now
     * @return timeUntilNext Seconds until next mint allowed (0 if can mint now)
     */
    function canMintNow(address company) external view returns (bool canMint, uint256 timeUntilNext) {
        if (!isRegisteredCompany[company]) {
            return (false, 0);
        }
        
        uint256 timeSinceLastMint = block.timestamp - lastMintTime[company];
        
        if (timeSinceLastMint >= MINT_COOLDOWN) {
            return (true, 0);
        } else {
            return (false, MINT_COOLDOWN - timeSinceLastMint);
        }
    }
    
    /**
     * @dev Get company information
     * @param company Company address
     * @return registered Whether company is registered
     * @return minted Total tokens minted to company
     * @return remaining Remaining mintable tokens
     * @return lastMint Timestamp of last mint
     */
    function getCompanyInfo(address company) external view returns (
        bool registered,
        uint256 minted,
        uint256 remaining,
        uint256 lastMint
    ) {
        registered = isRegisteredCompany[company];
        minted = mintedPerCompany[company];
        remaining = registered ? capPerCompany - minted : 0;
        lastMint = lastMintTime[company];
    }
    
    /**
     * @dev Emergency function to pause contract (inherited from OpenZeppelin if needed)
     * Can be extended with Pausable contract for emergency stops
     */
    
    /**
     * @dev Override transfer to add any carbon credit specific logic
     * Currently allows normal ERC-20 transfers
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        // Add any carbon credit transfer restrictions here if needed
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add any carbon credit specific logic
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        // Add any carbon credit transfer restrictions here if needed
        return super.transferFrom(from, to, amount);
    }

    // Enhanced functions for emission compliance system

    /**
     * @dev Mint carbon credits for companies under emission cap
     * @param company Address of the company
     * @param amount Amount of credits to mint based on emission savings
     * @param emissionValue Current emission value
     * @param emissionCap Emission cap for the company
     */
    function mintForCompliance(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external onlyOwner nonReentrant {
        require(company != address(0), "Invalid company address");
        require(amount > 0, "Amount must be greater than 0");
        require(isRegisteredCompany[company], "Company not registered");
        require(emissionValue < emissionCap, "Emission not under cap");
        
        // Mint credits for compliance
        _mint(company, amount);
        uint256 newBalance = balanceOf(company);
        
        // Emit comprehensive events for immutable logging
        emit ComplianceCheck(company, emissionValue, emissionCap, "UNDER_CAP", block.timestamp);
        emit ComplianceMint(company, amount, newBalance, block.timestamp);
        emit TokensMinted(company, amount, block.timestamp);
    }

    /**
     * @dev Deduct carbon credits for companies over emission cap
     * @param company Address of the company
     * @param amount Amount of credits to deduct
     * @param emissionValue Current emission value
     * @param emissionCap Emission cap for the company
     * @return success Whether deduction was successful
     * @return hasEnoughBalance Whether company had sufficient balance
     */
    function deductForOverage(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external onlyOwner nonReentrant returns (bool success, bool hasEnoughBalance) {
        require(company != address(0), "Invalid company address");
        require(amount > 0, "Amount must be greater than 0");
        require(isRegisteredCompany[company], "Company not registered");
        require(emissionValue > emissionCap, "Emission not over cap");
        
        uint256 balance = balanceOf(company);
        hasEnoughBalance = balance >= amount;
        
        // Emit compliance check event
        emit ComplianceCheck(company, emissionValue, emissionCap, "OVER_CAP", block.timestamp);
        
        if (hasEnoughBalance) {
            _burn(company, amount);
            uint256 newBalance = balanceOf(company);
            emit ComplianceDeduct(company, amount, newBalance, block.timestamp);
            success = true;
        } else {
            // Emit flagging event when insufficient balance
            emit CompanyFlagged(company, amount, balance, block.timestamp);
            emit BuyTimerStarted(company, block.timestamp + 120, amount, block.timestamp); // 2 minutes
            success = false;
        }
        
        return (success, hasEnoughBalance);
    }

    /**
     * @dev Purchase carbon credits - allows companies to buy credits
     * @param amount Amount of credits to purchase
     */
    function purchaseCredits(uint256 amount) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(isRegisteredCompany[msg.sender], "Company not registered");
        
        // Simple pricing: 1 ETH = 1000 credits (adjust as needed)
        uint256 requiredPayment = (amount * 1 ether) / 1000;
        require(msg.value >= requiredPayment, "Insufficient payment");
        
        // Mint the purchased credits
        _mint(msg.sender, amount);
        uint256 newBalance = balanceOf(msg.sender);
        
        // Refund excess payment
        if (msg.value > requiredPayment) {
            payable(msg.sender).transfer(msg.value - requiredPayment);
        }
        
        // Emit comprehensive events for immutable logging
        emit CreditPurchase(msg.sender, amount, newBalance, block.timestamp);
        emit TokensMinted(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw ETH from contract (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Get contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}