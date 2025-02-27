WORKSPACE="${WORKSPACE:-~/owl/workspace}"
VERASWAP="$(dirname $WORKSPACE)/veraswap"

session="vera"
privateKeyAnvil0="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Check if the session exists, discarding output
# We can check $? for the exit status (zero for success, non-zero for failure)
tmux has-session -t $session 2>/dev/null

if [ $? != 0 ]; then
    # Set up your session
    tmux new -s $session -d
    tmux new-window  -t $session -n anvil;
    tmux split-window -t $session:anvil -h;
    tmux new-window  -t $session -n deploy;
    tmux new-window  -t $session -n apps;
    # Start blockchain
    tmux send-keys -t $session:anvil.0 "cd $VERASWAP && anvil --chain-id 1337" ENTER
    tmux send-keys -t $session:anvil.1 "cd $VERASWAP && anvil -p 8546 --chain-id 1338" ENTER
    tmux send-keys -t $session:deploy \
"cd $VERASWAP/packages/veraswap-sdk && \
forge script ./script/DeployAnvil.s.sol --rpc-url http://127.0.0.1:8545 --private-key ${privateKeyAnvil0} --broadcast --via-ir --code-size-limit 393216 && \
forge script ./script/DeployAnvil.s.sol --rpc-url http://127.0.0.1:8546 --private-key ${privateKeyAnvil0} --broadcast --via-ir --code-size-limit 393216 && \
cd $WORKSPACE/packages-public/packages/contracts-hyperlane && \
tsx ./src/scripts/setupTestMailboxContractsWithProxy.ts && \
cd $VERASWAP/packages/veraswap-sdk && \
PRIVATE_KEY=${privateKeyAnvil0} tsx ./src/scripts/deployTestTokens.ts" ENTER

    # Start auth dev mode
    tmux send-keys -t $session:apps.0 "cd $VERASWAP/packages/veraswap-app && pnpm dev" ENTER
fi

if [ -n "${TMUX+1}" ]; then
    # Switch sessions within tmux
    tmux switch-client -t $session
else
    tmux a -t $session
fi
