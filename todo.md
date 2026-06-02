Because the most critical partial-failure scenarios happen during:

Create Run → create many Test instances

Save Result → update Test status

Run status transitions (Start/Complete/Abort)

So Results Service should own “execution workflow integrity”:

bulk/atomic operations (if you add them)

idempotency keys

deterministic retry support

consistency rules (“a test cannot be Completed without a result” OR “result implies completion”)

This is directly implied by your run/results flows.