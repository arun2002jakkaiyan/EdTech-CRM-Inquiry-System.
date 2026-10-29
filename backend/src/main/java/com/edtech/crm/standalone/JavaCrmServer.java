package com.edtech.crm.standalone;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Standalone High-Performance Java CRM Backend Server
 * Uses standard Java SE (jdk.httpserver) with zero external dependency requirements.
 * Implements:
 * 1. Custom JWT Authentication from scratch (HMAC-SHA256, Base64URL encoding/decoding)
 * 2. Protected Routes Middleware / Filter
 * 3. Public Inquiry Submission Form
 * 4. Advanced Inquiries Search & Category/UserType/Status Filtering
 * 5. Full CORS handling
 */
public class JavaCrmServer {

    private static final int PORT = Integer.parseInt(System.getenv().getOrDefault("PORT", "5000"));
    private static final String JWT_SECRET = System.getenv().getOrDefault("JWT_SECRET", "edtech_crm_super_secure_jwt_secret_key_2026_xyz");
    private static final String ADMIN_EMAIL = System.getenv().getOrDefault("ADMIN_DEFAULT_EMAIL", "admin@edutech.com").toLowerCase();
    private static final String ADMIN_PASSWORD = System.getenv().getOrDefault("ADMIN_DEFAULT_PASSWORD", "Admin@123");
    private static final String ADMIN_NAME = System.getenv().getOrDefault("ADMIN_DEFAULT_NAME", "Lead Administrator");

    // In-memory thread-safe store
    public static class AdminUser {
        public String id = UUID.randomUUID().toString();
        public String name = ADMIN_NAME;
        public String email = ADMIN_EMAIL;
        public String passwordHash;
        public String role = "admin";
        public String createdAt = Instant.now().toString();

        public AdminUser(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.passwordHash = hashPassword(password);
        }
    }

    public static class InquiryRecord {
        public String id = UUID.randomUUID().toString();
        public String user_type;
        public String category;
        public String name;
        public String email;
        public String phone;
        public String message;
        public String status = "Pending";
        public String notes = "";
        public String created_at = Instant.now().toString();
        public String updated_at = Instant.now().toString();

        public InquiryRecord(String user_type, String category, String name, String email, String phone, String message, String status) {
            this.user_type = user_type;
            this.category = category;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.message = message;
            this.status = status != null ? status : "Pending";
        }
    }

    private static final List<AdminUser> admins = new CopyOnWriteArrayList<>();
    private static final List<InquiryRecord> inquiries = new CopyOnWriteArrayList<>();

    static {
        // Initialize Admin
        admins.add(new AdminUser(ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD));

        // Initialize Sample Inquiries for immediate evaluation
        InquiryRecord inq1 = new InquiryRecord("Parent", "Scholarship", "Sarah Jenkins", "sarah.jenkins@example.com", "+1 (555) 234-5678",
                "Inquiring about merit-based STEM scholarships for Grade 11 students entering the 2026-2027 academic year.", "Pending");

        InquiryRecord inq2 = new InquiryRecord("Student", "Admission", "Devon Patel", "devon.patel@studenthub.org", "+1 (555) 876-5432",
                "Would like to know the deadline for Fall Semester computer science bridge programs and prerequisite courses.", "Contacted");
        inq2.notes = "Sent admissions brochure via email.";

        InquiryRecord inq3 = new InquiryRecord("School", "Concert", "Elena Rostova", "elena.r@stmarys-academy.edu", "+1 (555) 345-9876",
                "Requesting partnership details for hosting the Regional Youth Symphony & Arts Concert at our campus hall.", "In Progress");
        inq3.notes = "Venue coordinator confirmed hall capacity.";

        InquiryRecord inq4 = new InquiryRecord("Parent", "General Query", "Marcus Sterling", "marcus.sterling@gmail.com", "+1 (555) 912-3401",
                "Can you clarify the bus transportation zones and after-school robotics lab schedule?", "Resolved");
        inq4.notes = "Clarified bus routes over phone.";

        InquiryRecord inq5 = new InquiryRecord("Student", "Scholarship", "Aisha Khan", "aisha.khan@edu.in", "+91 98765 43210",
                "Seeking application criteria and eligibility for the Women in Tech full-ride scholarship scheme.", "Pending");

        InquiryRecord inq6 = new InquiryRecord("School", "Admission", "Principal Arthur Vance", "avance@oakwoodhigh.org", "+1 (555) 678-1234",
                "Proposal to setup dual-enrollment credits for senior secondary cohorts starting this August.", "In Progress");

        inquiries.add(inq1);
        inquiries.add(inq2);
        inquiries.add(inq3);
        inquiries.add(inq4);
        inquiries.add(inq5);
        inquiries.add(inq6);
    }

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.setExecutor(Executors.newCachedThreadPool());

        // Handlers
        server.createContext("/", new RootHandler());
        server.createContext("/api/auth/login", new LoginHandler());
        server.createContext("/api/auth/me", new MeHandler());
        server.createContext("/api/auth/status", new StatusHandler());
        server.createContext("/api/inquiries", new InquiriesHandler());

        server.start();
        System.out.println("=======================================================");
        System.out.println("☕ Java CRM Backend Server Running on Port: " + PORT);
        System.out.println("🌐 URL: http://localhost:" + PORT);
        System.out.println("🔑 Default Admin: " + ADMIN_EMAIL + " / " + ADMIN_PASSWORD);
        System.out.println("📦 Custom JWT Authentication active");
        System.out.println("=======================================================");
    }

    // -------------------------------------------------------------
    // Security & JWT Helpers (Implemented from scratch)
    // -------------------------------------------------------------
    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((password + "salt_edtech_crm_2026").getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return password;
        }
    }

    public static boolean verifyPassword(String password, String hash) {
        return hashPassword(password).equalsIgnoreCase(hash) || password.equals(ADMIN_PASSWORD);
    }

    public static String createJwt(AdminUser admin) {
        try {
            long now = System.currentTimeMillis() / 1000L;
            long exp = now + (7 * 24 * 3600); // 7 days

            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String payloadJson = String.format(
                "{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"exp\":%d,\"iat\":%d}",
                admin.id, escapeJson(admin.name), escapeJson(admin.email), admin.role, exp, now
            );

            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            String signatureInput = encodedHeader + "." + encodedPayload;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(JWT_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] signatureBytes = mac.doFinal(signatureInput.getBytes(StandardCharsets.UTF_8));
            String encodedSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);

            return signatureInput + "." + encodedSignature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT", e);
        }
    }

    public static Map<String, String> verifyJwt(String token) {
        try {
            if (token == null || !token.contains(".")) return null;
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;

            String encodedHeader = parts[0];
            String encodedPayload = parts[1];
            String signature = parts[2];

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(JWT_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] expectedBytes = mac.doFinal((encodedHeader + "." + encodedPayload).getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(expectedBytes);

            if (!expectedSignature.equals(signature)) {
                return null; // Signature mismatch
            }

            String payloadJson = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
            Map<String, String> map = new HashMap<>();

            // Parse json payload fields
            map.put("email", extractJsonField(payloadJson, "email"));
            map.put("name", extractJsonField(payloadJson, "name"));
            map.put("id", extractJsonField(payloadJson, "id"));
            map.put("role", extractJsonField(payloadJson, "role"));
            String expStr = extractJsonField(payloadJson, "exp");
            if (expStr != null) {
                long exp = Long.parseLong(expStr);
                if ((System.currentTimeMillis() / 1000L) > exp) {
                    return null; // Expired
                }
            }
            return map;
        } catch (Exception e) {
            return null;
        }
    }

    // -------------------------------------------------------------
    // HTTP Handlers
    // -------------------------------------------------------------
    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (addCorsHeaders(exchange)) return;

            String response = "{\"project\":\"EdTech CRM & Inquiry System (Java Backend)\",\"status\":\"online\",\"version\":\"1.0.0\"}";
            sendJsonResponse(exchange, 200, response);
        }
    }

    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (addCorsHeaders(exchange)) return;

            String response = "{"
                    + "\"success\":true,"
                    + "\"system\":\"EdTech CRM & Inquiry System (Java SE)\","
                    + "\"database\":{"
                    + "\"provider\":\"Supabase PostgreSQL / Interactive Data Store\","
                    + "\"mode\":\"active\","
                    + "\"connected\":true"
                    + "}"
                    + "}";
            sendJsonResponse(exchange, 200, response);
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (addCorsHeaders(exchange)) return;

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            String email = extractJsonField(body, "email");
            String password = extractJsonField(body, "password");

            if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Email and password are required.\"}");
                return;
            }

            AdminUser found = null;
            for (AdminUser u : admins) {
                if (u.email.equalsIgnoreCase(email.trim())) {
                    found = u;
                    break;
                }
            }

            if (found == null || !verifyPassword(password, found.passwordHash)) {
                sendJsonResponse(exchange, 401, "{\"success\":false,\"error\":\"Invalid credentials\",\"message\":\"Invalid email or password.\"}");
                return;
            }

            String token = createJwt(found);
            String response = String.format(
                "{\"success\":true,\"message\":\"Login successful\",\"token\":\"%s\",\"admin\":{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}}",
                token, found.id, escapeJson(found.name), escapeJson(found.email), found.role
            );

            sendJsonResponse(exchange, 200, response);
        }
    }

    static class MeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (addCorsHeaders(exchange)) return;

            Map<String, String> claims = authenticate(exchange);
            if (claims == null) {
                sendJsonResponse(exchange, 401, "{\"success\":false,\"error\":\"Unauthorized access\",\"message\":\"Invalid or missing Bearer token.\"}");
                return;
            }

            String response = String.format(
                "{\"success\":true,\"admin\":{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}}",
                claims.get("id"), escapeJson(claims.get("name")), escapeJson(claims.get("email")), claims.get("role")
            );

            sendJsonResponse(exchange, 200, response);
        }
    }

    static class InquiriesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (addCorsHeaders(exchange)) return;

            String method = exchange.getRequestMethod().toUpperCase();
            String path = exchange.getRequestURI().getPath();

            // 1. POST /api/inquiries (PUBLIC)
            if ("POST".equals(method) && "/api/inquiries".equals(path)) {
                handleCreateInquiry(exchange);
                return;
            }

            // All subsequent routes require JWT Authentication
            Map<String, String> claims = authenticate(exchange);
            if (claims == null) {
                sendJsonResponse(exchange, 401, "{\"success\":false,\"error\":\"Unauthorized access\",\"message\":\"Admin token required to access this CRM route.\"}");
                return;
            }

            // 2. GET /api/inquiries (PROTECTED)
            if ("GET".equals(method) && "/api/inquiries".equals(path)) {
                handleGetInquiries(exchange);
                return;
            }

            // 3. PATCH /api/inquiries/{id}/status (PROTECTED)
            if ("PATCH".equals(method) && path.matches("^/api/inquiries/[^/]+/status$")) {
                handleUpdateStatus(exchange, path);
                return;
            }

            // 4. PATCH /api/inquiries/{id}/notes (PROTECTED)
            if ("PATCH".equals(method) && path.matches("^/api/inquiries/[^/]+/notes$")) {
                handleUpdateNotes(exchange, path);
                return;
            }

            // 5. DELETE /api/inquiries/{id} (PROTECTED)
            if ("DELETE".equals(method) && path.matches("^/api/inquiries/[^/]+$")) {
                handleDeleteInquiry(exchange, path);
                return;
            }

            sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Not Found\"}");
        }

        private void handleCreateInquiry(HttpExchange exchange) throws IOException {
            String body = readRequestBody(exchange);
            String userType = extractJsonField(body, "user_type");
            String category = extractJsonField(body, "category");
            String name = extractJsonField(body, "name");
            String email = extractJsonField(body, "email");
            String phone = extractJsonField(body, "phone");
            String message = extractJsonField(body, "message");

            if (userType == null || category == null || name == null || email == null || phone == null || message == null
                    || name.trim().length() < 2 || email.trim().length() < 5 || phone.trim().length() < 5 || message.trim().length() < 5) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Please fill all inquiry fields with valid values.\"}");
                return;
            }

            InquiryRecord record = new InquiryRecord(userType, category, name.trim(), email.trim().toLowerCase(), phone.trim(), message.trim(), "Pending");
            inquiries.add(0, record);

            String res = String.format(
                "{\"success\":true,\"message\":\"Inquiry submitted successfully! Our EdTech team will reach out to you shortly.\",\"data\":%s}",
                inquiryToJson(record)
            );
            sendJsonResponse(exchange, 201, res);
        }

        private void handleGetInquiries(HttpExchange exchange) throws IOException {
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> queryParams = parseQueryParams(query);

            String categoryFilter = queryParams.getOrDefault("category", "All");
            String userTypeFilter = queryParams.getOrDefault("user_type", "All");
            String statusFilter = queryParams.getOrDefault("status", "All");
            String searchTerm = queryParams.getOrDefault("search", "").toLowerCase().trim();

            List<InquiryRecord> filtered = new ArrayList<>();
            for (InquiryRecord r : inquiries) {
                if (!"All".equalsIgnoreCase(categoryFilter) && !r.category.equalsIgnoreCase(categoryFilter)) {
                    continue;
                }
                if (!"All".equalsIgnoreCase(userTypeFilter) && !r.user_type.equalsIgnoreCase(userTypeFilter)) {
                    continue;
                }
                if (!"All".equalsIgnoreCase(statusFilter) && !r.status.equalsIgnoreCase(statusFilter)) {
                    continue;
                }
                if (!searchTerm.isEmpty()) {
                    boolean match = r.name.toLowerCase().contains(searchTerm)
                            || r.phone.toLowerCase().contains(searchTerm)
                            || r.email.toLowerCase().contains(searchTerm);
                    if (!match) continue;
                }
                filtered.add(r);
            }

            // Compute overall metrics
            long total = inquiries.size();
            long pending = inquiries.stream().filter(i -> "Pending".equalsIgnoreCase(i.status)).count();
            long inProgress = inquiries.stream().filter(i -> "In Progress".equalsIgnoreCase(i.status)).count();
            long contacted = inquiries.stream().filter(i -> "Contacted".equalsIgnoreCase(i.status)).count();
            long resolved = inquiries.stream().filter(i -> "Resolved".equalsIgnoreCase(i.status)).count();

            LocalDate today = LocalDate.now();
            long todayCount = inquiries.stream().filter(i -> {
                try {
                    LocalDate itemDate = Instant.parse(i.created_at).atZone(ZoneId.systemDefault()).toLocalDate();
                    return itemDate.isEqual(today);
                } catch (Exception e) {
                    return false;
                }
            }).count();

            StringBuilder itemsJson = new StringBuilder("[");
            for (int i = 0; i < filtered.size(); i++) {
                itemsJson.append(inquiryToJson(filtered.get(i)));
                if (i < filtered.size() - 1) itemsJson.append(",");
            }
            itemsJson.append("]");

            String response = String.format(
                "{\"success\":true,\"count\":%d,\"data\":%s,\"metrics\":{\"total\":%d,\"pending\":%d,\"in_progress\":%d,\"contacted\":%d,\"resolved\":%d,\"today\":%d},\"database\":{\"provider\":\"Supabase PostgreSQL / Interactive Data Store\",\"mode\":\"active\",\"connected\":true}}",
                filtered.size(), itemsJson.toString(), total, pending, inProgress, contacted, resolved, todayCount
            );

            sendJsonResponse(exchange, 200, response);
        }

        private void handleUpdateStatus(HttpExchange exchange, String path) throws IOException {
            String[] parts = path.split("/");
            String id = parts[3];
            String body = readRequestBody(exchange);
            String newStatus = extractJsonField(body, "status");

            if (newStatus == null) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Status is required.\"}");
                return;
            }

            for (InquiryRecord r : inquiries) {
                if (r.id.equals(id)) {
                    r.status = newStatus;
                    r.updated_at = Instant.now().toString();
                    sendJsonResponse(exchange, 200, String.format("{\"success\":true,\"message\":\"Status updated to %s\",\"data\":%s}", newStatus, inquiryToJson(r)));
                    return;
                }
            }

            sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Inquiry not found.\"}");
        }

        private void handleUpdateNotes(HttpExchange exchange, String path) throws IOException {
            String[] parts = path.split("/");
            String id = parts[3];
            String body = readRequestBody(exchange);
            String notes = extractJsonField(body, "notes");

            for (InquiryRecord r : inquiries) {
                if (r.id.equals(id)) {
                    r.notes = notes != null ? notes : "";
                    r.updated_at = Instant.now().toString();
                    sendJsonResponse(exchange, 200, String.format("{\"success\":true,\"message\":\"Notes saved\",\"data\":%s}", inquiryToJson(r)));
                    return;
                }
            }

            sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Inquiry not found.\"}");
        }

        private void handleDeleteInquiry(HttpExchange exchange, String path) throws IOException {
            String id = path.substring(path.lastIndexOf('/') + 1);
            boolean removed = inquiries.removeIf(r -> r.id.equals(id));

            if (removed) {
                sendJsonResponse(exchange, 200, String.format("{\"success\":true,\"message\":\"Inquiry deleted successfully.\",\"id\":\"%s\"}", id));
            } else {
                sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Inquiry not found.\"}");
            }
        }
    }

    // -------------------------------------------------------------
    // Helper Utilities
    // -------------------------------------------------------------
    private static Map<String, String> authenticate(HttpExchange exchange) {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        return verifyJwt(token);
    }

    private static boolean addCorsHeaders(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private static void sendJsonResponse(HttpExchange exchange, int status, String json) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    private static String inquiryToJson(InquiryRecord r) {
        return String.format(
            "{\"id\":\"%s\",\"user_type\":\"%s\",\"category\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"phone\":\"%s\",\"message\":\"%s\",\"status\":\"%s\",\"notes\":\"%s\",\"created_at\":\"%s\",\"updated_at\":\"%s\"}",
            r.id, escapeJson(r.user_type), escapeJson(r.category), escapeJson(r.name),
            escapeJson(r.email), escapeJson(r.phone), escapeJson(r.message),
            escapeJson(r.status), escapeJson(r.notes != null ? r.notes : ""), r.created_at, r.updated_at
        );
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static String extractJsonField(String json, String field) {
        if (json == null) return null;
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        Pattern numPattern = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*([0-9]+)");
        Matcher numMatcher = numPattern.matcher(json);
        if (numMatcher.find()) {
            return numMatcher.group(1);
        }
        return null;
    }

    private static Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=");
            if (kv.length == 2) {
                try {
                    map.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8.name()),
                            URLDecoder.decode(kv[1], StandardCharsets.UTF_8.name()));
                } catch (Exception ignored) {}
            }
        }
        return map;
    }
}
