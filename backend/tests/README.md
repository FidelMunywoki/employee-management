### Run Tests (all test files)
docker compose exec backend pytest -v 

### Run Tests for one file

docker compose exec backend pytest tests/test_attendance.py -v

### Everything except one slow/flaky test (useful for testing one test):

docker compose exec backend pytest -v --deselect tests/test_attendance.py::test_concurrent_clock_in_only_creates_one_record

### Only tests whose name contains a keyword (handy for quick iteration without remembering exact paths):

docker compose exec backend pytest -v -k "attendance"