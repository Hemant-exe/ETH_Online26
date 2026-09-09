// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProfileNFT — non‑transferable soulbound ERC721 for user profiles, mintable once per address, updatable & burnable
contract ProfileNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    // Track which addresses have already minted
    mapping(address => bool) public hasProfile;
    mapping(address => uint256) public UserProfileId;

    constructor() ERC721("DatingProfile", "DPRO") Ownable(msg.sender) {}

    ///EVENTS
    event ProfileCreated(uint256 indexed tokenId, string veridaURI);
    event ProfileUpdated(uint256 indexed tokenId, string veridaURI);
    event ProfileBurned(uint256 indexed tokenId);

    /// @notice Mint your profile NFT once
    /// @param tokenURI_ initial metadata URI (e.g. pointing to JSON with your profile info)
    function createProfile(
        string calldata tokenURI_
    ) external returns (uint256) {
        require(!hasProfile[msg.sender], "Already minted");
        uint256 tokenId = _nextTokenId++;
        hasProfile[msg.sender] = true;
        UserProfileId[msg.sender] = tokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        emit ProfileCreated(tokenId, tokenURI_);
        return tokenId;
    }

    /// @notice Update the metadata URI of your profile NFT
    /// @param tokenId the ID of your profile NFT
    /// @param newTokenURI the new metadata URI
    function updateProfile(
        uint256 tokenId,
        string calldata newTokenURI
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not your profile");
        _setTokenURI(tokenId, newTokenURI);
        emit ProfileUpdated(tokenId, newTokenURI);
    }

    /// @notice Burn (destroy) your profile NFT
    /// @dev Resets hasProfile so you could mint again if desired
    /// @param tokenId the ID of your profile NFT
    function burnProfile(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not your profile");
        // This will clear approvals, transfer, and tokenURI storage
        _burn(tokenId);
        // Allow the user to re-mint in future if they want a fresh profile
        hasProfile[msg.sender] = false;
        UserProfileId[msg.sender] = 0;
        emit ProfileBurned(tokenId);
    }

    // -- Disable all transfers and approvals to make it soulbound --

    /// @dev Disable all standard transfers
    function transferFrom(
        address,
        address,
        uint256
    ) public virtual override(ERC721, IERC721) {
        revert("Non transferable");
    }

    function approve(
        address,
        uint256
    ) public virtual override(ERC721, IERC721) {
        revert("Non transferable");
        // super.approve(address(0), 0);
    }

    function setApprovalForAll(
        address,
        bool
    ) public virtual override(ERC721, IERC721) {
        revert("Non transferable");
        // super.setApprovalForAll(address(0), false);
    }
}
