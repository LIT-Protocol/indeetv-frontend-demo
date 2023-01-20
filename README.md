IndeeTV Frontend Demo. Run this on localhost:3001.

Will also need an IndeeTV PIN to work.

Set **REACT_APP_DEV=true** in .env to use on localhost

The video flow and the widget flow are the same, but the widget flow is all in one file, so most of the code commentary
is there.

High level flow:

1. user connects wallet - see line 62 of Widget.js and function **performWithAuthSig()**

2. user tries to access protected content - see line 79 of Widget.js and function **getJwt()**

3. if user does not own the requisite NFT, they are rejected, **OR** if user dows own the requisite NFT, they are
   granted
   access - see line 95 if Widget.js and function **validateWithIndeeAndLogin**.  