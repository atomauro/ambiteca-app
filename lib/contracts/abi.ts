// ABI del contrato PerlaVerdeV1
export const PERLA_VERDE_ABI = [
  // Funciones de lectura
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function version() view returns (string)",
  "function owner() view returns (address)",
  "function tokenBridge() view returns (address)",
  "function paused() view returns (bool)",
  
  // Funciones de roles
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function canMint(address account) view returns (bool)",
  "function isAmbitecaAuthorized(address ambiteca) view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function MINTER_ROLE() view returns (bytes32)",
  "function BRIDGE_ROLE() view returns (bytes32)",
  "function AMBITECA_ROLE() view returns (bytes32)",
  "function UPGRADER_ROLE() view returns (bytes32)",
  
  // Funciones de escritura - ERC20
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Funciones de escritura - Minting
  "function mint(address to, uint256 amount)",
  "function mintForDelivery(address to, uint256 amount, bytes32 deliveryId)",
  "function mintFromAmbiteca(address to, uint256 amount, bytes32 deliveryId)",
  "function bridgeMint(address to, uint256 amount, bytes32 bridgeId)",
  
  // Funciones de escritura - Administración
  "function setTokenBridge(address newBridge)",
  "function setAmbitecaAuthorization(address ambiteca, bool authorized)",
  "function pause()",
  "function unpause()",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  
  // Funciones de escritura - Burnable
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  
  // Funciones de escritura - Permit
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
  
  // Funciones de escritura - Upgrades
  "function upgradeToAndCall(address newImplementation, bytes calldata data)",
  
  // Eventos
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TokensMintedForDelivery(address indexed recipient, uint256 amount, bytes32 indexed deliveryId)",
  "event TokensBridgeMinted(address indexed recipient, uint256 amount, bytes32 indexed bridgeId)",
  "event AmbitecaAuthorized(address indexed ambiteca, bool authorized)",
  "event BridgeUpdated(address indexed oldBridge, address indexed newBridge)",
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
  "event Paused(address account)",
  "event Unpaused(address account)",
] as const;
