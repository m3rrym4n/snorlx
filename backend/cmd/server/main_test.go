package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCSRFMiddleware_AllowsServerToServerRequestWithoutOrigin(t *testing.T) {
	called := false
	handler := csrfMiddleware("https://snorlx.example")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusNoContent)
	}))
	req := httptest.NewRequest(http.MethodPost, "/api/runs/1/rerun", nil)
	req.Header.Set("Authorization", "Bearer snx_example")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if !called || rec.Code != http.StatusNoContent {
		t.Fatalf("expected request without Origin to pass, got status %d", rec.Code)
	}
}
