import { useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";

// Running Character Loading Animation Component
function RunningCharacterLoader() {
  return (
    <div style={loadingStyles.container}>
      <div style={loadingStyles.runningContainer}>
        <div style={loadingStyles.running}>
          <div style={loadingStyles.outer}>
            <div style={loadingStyles.body}>
              <div style={loadingStyles.armBehind}></div>
              <div style={loadingStyles.armFront}></div>
              <div style={loadingStyles.legBehind}></div>
              <div style={loadingStyles.legFront}></div>
            </div>
          </div>
        </div>
      </div>
      <p style={loadingStyles.text}>📖 Searching for book...</p>
      <div style={loadingStyles.dots}>
        <span style={loadingStyles.dot}></span>
        <span style={loadingStyles.dot}></span>  
        <span style={loadingStyles.dot}></span>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("scan");
  const [isbn, setIsbn] = useState("");
  const [manualIsbn, setManualIsbn] = useState("");
  const [titleFromBackend, setTitleFromBackend] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [showManualTitle, setShowManualTitle] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ✅ NEW loading state
  const [location, setLocation] = useState("");

  const fetchTitle = async (isbnToUse) => {
    setIsLoading(true); // ✅ Start loading animation
    try {
      const response = await fetch("https://testocrtest.pythonanywhere.com/receive_isbn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn: isbnToUse }),
      });

      const data = await response.json();
      setIsbn(isbnToUse);

      if (data.title) {
        setTitleFromBackend(data.title);
        setManualTitle("");
        setShowManualTitle(false);
      } else {
        setTitleFromBackend("");
        setShowManualTitle(true);
      }
      setView("priceEntry");
    } catch (error) {
      setTitleFromBackend("");
      setShowManualTitle(true);
      setView("priceEntry");
    } finally {
      setIsLoading(false); // ✅ Stop loading animation
    }
  };

  const sendToBackend = async () => {
    const title = titleFromBackend || manualTitle;
    if (!isbn || !title || !price || !quantity || !location) {
      alert("Please fill in all fields including location.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("https://testocrtest.pythonanywhere.com/save_title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn, b_title: title, price, quantity, location }),
      });

      const data = await response.json();
      setIsSaved(true);
      setSaveMessage("✅ Saved successfully");
    } catch (error) {
      setSaveMessage("❌ Error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setView("scan");
    setIsbn("");
    setManualIsbn("");
    setTitleFromBackend("");
    setManualTitle("");
    setPrice("");
    setQuantity("1");
    setLocation("");
    setShowManualTitle(false);
    setIsSaved(false);
    setSaveMessage("");
    setIsSaving(false);
    setIsLoading(false); // ✅ Reset loading state
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {view === "scan" && (
          <>
            <h1 style={styles.header}>📚 ISBN Scanner</h1>
            <p style={styles.subText}>Scan to Store Book</p>
            <button
              style={styles.primaryButton}
              onClick={() => setView("liveScanner")}
            >
              Scan ISBN
            </button>
            <p style={{ ...styles.subText, margin: "20px 0 8px 0" }}>OR</p>
            <button
              style={styles.manualButton}
              onClick={() => setView("manualIsbn")}
            >
              Enter Manually
            </button>
          </>
        )}

        {view === "manualIsbn" && (
          <>
            <h3>Manual ISBN Entry</h3>
            <input
              value={manualIsbn}
              onChange={(e) => setManualIsbn(e.target.value)}
              placeholder="Enter ISBN"
              style={styles.input}
            />
            <button
              style={styles.primaryButton}
              onClick={() => fetchTitle(manualIsbn.trim())}
            >
              Next
            </button>
            <button style={styles.secondaryButton} onClick={handleBack}>
              Back
            </button>
          </>
        )}

        {view === "liveScanner" && (
          <>
            <h3>Focus on Barcode</h3>
            <div style={styles.scannerArea}>
              <BarcodeScanner onDetected={fetchTitle} />
              <div style={styles.scannerLine} />
            </div>
            <button style={styles.secondaryButton} onClick={handleBack}>
              Back
            </button>
          </>
        )}

        {view === "priceEntry" && (
          <>
            {/* ✅ Show loading animation while fetching */}
            {isLoading ? (
              <RunningCharacterLoader />
            ) : (
              <>
                <p style={{ textAlign: "left", fontWeight: 500, color: "#555", marginBottom: 8 }}>
                  <span style={{ color: "#2196f3" }}>ISBN:</span> {isbn}
                </p>
                {titleFromBackend && (
                  <p style={{ textAlign: "left", fontWeight: 500, color: "#555", marginBottom: 8 }}>
                    <span style={{ color: "#2196f3" }}>Title:</span> {titleFromBackend}
                  </p>
                )}
                {showManualTitle && (
                  <>
                    <p style={styles.inputLabel}>Enter Book Title:</p>
                    <input
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Enter title"
                      style={styles.input}
                    />
                  </>
                )}
                <p style={styles.inputLabel}>Enter Price:</p>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  style={styles.input}
                  min={0}
                />
                <p style={styles.inputLabel}>Enter Quantity:</p>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  style={styles.input}
                  min={1}
                />
                <p style={styles.inputLabel}>Select Location:</p>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ ...styles.input, paddingRight: 10, cursor: "pointer" }}
                >
                  <option value="">-- Select Location --</option>
                  <option value="DLF">DLF</option>
                  <option value="GRANDMALL">GRAND MALL</option>
                  <option value="MARINAMALL">MARINA MALL</option>
                  <option value="SKYWALK">SKYWALK</option>
                  <option value="WAREHOUS">WAREHOUSE</option>
                  <option value="GARUDA-BNGLR">Garuda-Bnglr</option>
                </select>
                {!isSaved && (
                  <button
                    style={{
                      ...styles.saveButton,
                      opacity: isSaving ? 0.6 : 1,
                      cursor: isSaving ? "not-allowed" : "pointer",
                    }}
                    onClick={sendToBackend}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "💾 Save"}
                  </button>
                )}
                {saveMessage && (
                  <div style={{ marginTop: 14 }}>
                    <span
                      style={{
                        color: isSaved ? "#28a745" : "#e53935",
                        fontWeight: 600,
                        fontSize: "15px",
                      }}
                    >
                      {saveMessage}
                    </span>
                  </div>
                )}
                <button style={styles.secondaryButton} onClick={handleBack}>
                  Return to Scanner
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ✅ Loading Animation Styles
const loadingStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    textAlign: "center",
  },
  runningContainer: {
    marginBottom: 20,
  },
  running: {
    color: "#007bff",
    animationDuration: "0.8s",
  },
  outer: {
    animation: "runningBounce 0.8s linear infinite",
  },
  body: {
    background: "#007bff",
    height: 15,
    width: 8,
    borderRadius: 4,
    transformOrigin: "4px 11px",
    position: "relative",
    transform: "rotate(32deg)",
    animation: "runningBody 0.8s linear infinite",
  },
  armBehind: {
    content: "",
    width: 11,
    height: 4,
    top: 0,
    left: 2,
    borderRadius: 2,
    transformOrigin: "2px 2px",
    position: "absolute",
    background: "#007bff",
    transform: "rotate(164deg)",
    animation: "runningArmBehind 0.8s linear infinite",
  },
  armFront: {
    content: "",
    width: 11,
    height: 4,
    top: 0,
    left: 2,
    borderRadius: 2,
    transformOrigin: "2px 2px",
    position: "absolute",
    background: "#007bff",
    transform: "rotate(24deg)",
    animation: "runningArmFront 0.8s linear infinite",
  },
  legBehind: {
    content: "",
    width: 12,
    height: 4,
    top: 11,
    left: 2,
    borderRadius: 2,
    transformOrigin: "2px 2px",
    position: "absolute",
    background: "#007bff",
    transform: "rotate(108deg)",
    animation: "runningLegBehind 0.8s linear infinite",
  },
  legFront: {
    content: "",
    width: 12,
    height: 4,
    top: 11,
    left: 2,
    borderRadius: 2,
    transformOrigin: "2px 2px",
    position: "absolute",
    background: "#007bff",
    transform: "rotate(10deg)",
    animation: "runningLegFront 0.8s linear infinite",
  },
  text: {
    fontSize: 18,
    fontWeight: 600,
    color: "#007bff",
    margin: "10px 0",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#007bff",
    borderRadius: "50%",
    margin: "0 3px",
    animation: "dotPulse 1.4s infinite ease-in-out",
    animationDelay: "0s",
  },
};

// ✅ Your existing styles (unchanged)
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #c3cfe2 0%, #eef2f3 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    textAlign: "center",
    margin: "0 8px",
    position: "relative",
    animation: "fadeIn 0.7s"
  },
  header: {
    fontSize: "30px",
    color: "#007bff",
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 8,
    textShadow: "0 2px 10px #e3f2fd99"
  },
  subText: {
    color: "#666",
    marginBottom: "18px",
    fontWeight: 500,
    letterSpacing: 0.5,
  },
  inputLabel: {
    fontWeight: 500,
    color: "#444",
    textAlign: "left",
    margin: "7px 0 2px 2px",
    fontSize: "15px"
  },
  input: {
    padding: "12px",
    width: "90%",
    borderRadius: "10px",
    border: "1.5px solid #b0bbd0",
    background: "#f7fbfc",
    fontSize: "15px",
    marginBottom: "12px",
    transition: "border 0.2s"
  },
  primaryButton: {
    background: "linear-gradient(90deg,#007bff,#2186eb)",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    padding: "16px 30px",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "14px",
    marginBottom: 0,
    boxShadow: "0 2px 12px 0 #007bff33",
    transition: "background 0.2s, transform 0.1s"
  },
  manualButton: {
    background: "linear-gradient(90deg,#17a2b8,#13cdc7)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: "6px",
    marginBottom: 8,
    transition: "background 0.2s, transform 0.1s"
  },
  saveButton: {
    background: "linear-gradient(90deg,#28a745,#32c455)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 28px",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 3px 14px #28a74541",
    transition: "background 0.2s, transform 0.1s"
  },
  secondaryButton: {
    background: "linear-gradient(90deg,#ffc107,#ff9800)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: "16px",
    transition: "background 0.2s, transform 0.1s"
  },
  scannerArea: {
    border: "4px solid #00bcd4",
    borderRadius: "18px",
    boxShadow: "0 2px 30px #4fd1c599",
    width: "90%",
    maxWidth: "320px",
    margin: "0 auto 18px",
    position: "relative",
    overflow: "hidden",
    height: "240px",
    background: "#ecfbfa"
  },
  scannerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "4px",
    top: 0,
    background: "linear-gradient(90deg,#00c6ff,#0072ff,#00c6ff)",
    animation: "scan-line 2s linear infinite"
  },
};
