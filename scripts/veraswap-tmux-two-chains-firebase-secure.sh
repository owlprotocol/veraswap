# Get parent directory of this script's directory
VERASWAP="$(dirname $(dirname $(realpath $0)))"

session="vera"
privateKeyAnvil0="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
privateKeyAnvil9="0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"

# Check if the session exists, discarding output
# We can check $? for the exit status (zero for success, non-zero for failure)
tmux has-session -t $session 2>/dev/null

if [ $? != 0 ]; then
    # Set up your session
    tmux new -s $session -d
    tmux new-window  -t $session -n supersim;
    # tmux new-window  -t $session -n anvil;
    # tmux split-window -t $session:anvil -h -l 66%;
    # tmux split-window -t $session:anvil -h -l 50%;
    tmux new-window  -t $session -n deploy;
    tmux new-window  -t $session -n apps;
    tmux new-window -t $session -n duster;
    tmux new-window -t $session -n scoutup;
    # Start blockchains
    tmux send-keys -t $session:supersim.0 "cd $VERASWAP && supersim --interop.autorelay --l1.port 8547" ENTER
    # tmux send-keys -t $session:anvil.0 "cd $VERASWAP && anvil -p 8547 --chain-id 900" ENTER
    # tmux send-keys -t $session:anvil.1 "cd $VERASWAP && anvil -p 9545 --chain-id 901" ENTER
    # tmux send-keys -t $session:anvil.2 "cd $VERASWAP && anvil -p 9546 --chain-id 902" ENTER
    tmux send-keys -t $session:deploy \
"cd $VERASWAP/packages/veraswap-sdk && \
forge script ./script/DeployLocalSupersim.s.sol --private-key ${privateKeyAnvil0} --broadcast && \
HYP_KEY=${privateKeyAnvil9} hyperlane relayer -r ./registry --chains opchainl1,opchaina,opchainb" ENTER

    # Start auth dev mode
    tmux send-keys -t $session:apps.0 "cd $VERASWAP/packages/veraswap-app && pnpm dev" ENTER
     # Start duster
    tmux send-keys -t $session:duster.0 "cd $VERASWAP/packages/veraswap-test-duster && PRIVATE_KEY=${privateKeyAnvil0} pnpm dev" ENTER
    # tmux send-keys -t $session:scoutup.0 "cd $VERASWAP/tools/scoutup && go build && sleep 5 && ./scoutup --supersim" ENTER
fi

if [ -n "${TMUX+1}" ]; then
    # Switch sessions within tmux
    tmux switch-client -t $session
else
    tmux a -t $session
fi
