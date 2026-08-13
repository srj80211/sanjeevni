import unittest
from face_service_simple import find_best_match


class FaceMatchingTests(unittest.TestCase):
    def test_find_best_match_ignores_empty_entries_and_returns_correct_user(self):
        user_a = {"userId": "user-a", "embedding": [0.0] * 128}
        user_b = {"userId": "user-b", "embedding": [0.5] * 128}
        user_c = {"userId": "user-c", "embedding": [1.0] * 128}

        live = [0.0] * 128
        result = find_best_match(live, [None, user_a, {"userId": "user-b", "embedding": []}, user_c])

        self.assertTrue(result["match"])
        self.assertEqual(result["userId"], "user-a")
        self.assertEqual(result["index"], 1)


if __name__ == "__main__":
    unittest.main()
