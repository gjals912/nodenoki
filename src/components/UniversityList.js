import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import Papa from "papaparse";
import "./UniversityList.css";

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_API_KEY;

const IndustryInfoList = () => {
  const [websites, setWebsites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("국문");
  const [sheetTab, setSheetTab] = useState("리포트"); // 기본 시트 탭
  const [loading, setLoading] = useState(true);

  // 언어별 시트 탭 목록
  const tabs = language === "국문"
    ? [ "리포트","국문", "보고서2"]   // 실제 구글시트 탭명으로 변경하세요
    : ["Report","영문", "Report2"]; // 실제 구글시트 탭명으로 변경하세요

  // 언어 변경 시 기본 탭도 초기화
  const toggleLanguage = () => {
    if (language === "국문") {
      setLanguage("영문");
      setSheetTab("영문");
    } else {
      setLanguage("국문");
      setSheetTab("국문");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetTab}?key=${API_KEY}`;

    try {
      const response = await axios.get(url);
      const data = response.data.values;
      if (!data || data.length === 0) {
        setWebsites([]);
        return;
      }
      const formattedData = data.slice(2).map((row) => ({
        siteName: row[0] || (language === "국문" ? "정보 없음" : "Information not available"),
        category: row[1] || (language === "국문" ? "정보 없음" : "Information not available"),
        mainService: row[2] || (language === "국문" ? "정보 없음" : "Information not available"),
        coverage: row[4] || (language === "국문" ? "정보 없음" : "Information not available"),
        contact: row[5] || (language === "국문" ? "정보 없음" : "Information not available"),
        remarks: row[6] || (language === "국문" ? "정보 없음" : "Information not available"),
        toolsUsed: row[7]?.split(",").map((tool) => tool.trim()) || [(language === "국문" ? "정보 없음" : "Information not available")],
        website: row[3] || (language === "국문" ? "정보 없음" : "Information not available"),
      }));

      setWebsites(formattedData);
    } catch (error) {
      console.error("API 요청 실패:", error);
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language, sheetTab]);

  // 검색 필터링
  const filteredWebsites = websites.filter((site) =>
    `${site.siteName} ${site.mainService} ${site.category}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CSV 다운로드
  const downloadContactList = () => {
    const contactData = websites.map((site) => ({
      siteName: site.siteName,
      category: site.category,
      mainService: site.mainService,
      contact: site.contact,
      remarks: site.remarks,
    }));

    const csv = Papa.unparse(contactData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "industry_info_sites.csv";
    link.click();
  };

  // '-' 기준으로 줄바꿈 처리하는 함수
  const renderContactWithLineBreaks = (contact) => {
    if (!contact) return null;
    const lines = contact.split("-").map(line => line.trim()).filter(line => line.length > 0);
    return lines.map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="university-list">
      <h1>{language === "국문" ? "AI로 만드는 맞춤 정보 수집 사이트" : "Custom Information Collection Site Powered by AI"}</h1>
      <p className="subtitle">
        {language === "국문"
          ? "산업정보, 경쟁사 분석, 시장동향 등 보고서 작성에 필요한 정보를 쉽게 모아드립니다."
          : "Easily gather information for reports including industry info, competitor analysis, and market trends."}
      </p>

      {/* 탭 선택 UI */}
      <div className="tab-buttons" style={{ marginBottom: 16 }}>
        {tabs.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setSheetTab(tabName)}
            style={{
              background: sheetTab === tabName ? "#007bff" : "#eee",
              color: sheetTab === tabName ? "white" : "black",
              marginRight: 8,
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => { if(sheetTab !== tabName) e.target.style.background = "#ddd"; }}
            onMouseLeave={(e) => { if(sheetTab !== tabName) e.target.style.background = "#eee"; }}
          >
            {tabName}
          </button>
        ))}
      </div>

      {loading ? (
        <p>{language === "국문" ? "로딩 중..." : "Loading..."}</p>
      ) : (
        <>
          <div className="search-container">
            <input
              type="text"
              placeholder={language === "국문" ? "웹사이트명, 주요 서비스, 분야 검색..." : "Search site name, services, categories..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-button" aria-label={language === "국문" ? "검색" : "Search"}>
              <FaSearch size={18} color="#fff" />
            </button>
          </div>

          <button
            onClick={toggleLanguage}
            style={{
              marginRight: "20px",
              padding: "12px 24px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background 0.3s ease",
              marginBottom: 16,
            }}
            onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
            onMouseLeave={(e) => (e.target.style.background = "#007bff")}
          >
            {language === "국문" ? "영문 보기" : "View in Korean"}
          </button>

          <button
            onClick={downloadContactList}
            style={{
              padding: "12px 24px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background 0.3s ease",
              marginBottom: 16,
            }}
          >
            {language === "국문" ? "연락처 및 서비스 CSV 다운로드" : "Download Contact and Service CSV"}
          </button>

          <ul className="university-grid">
            {filteredWebsites.length === 0 ? (
              <p>{language === "국문" ? "검색 결과가 없습니다." : "No results found."}</p>
            ) : (
              filteredWebsites.map((site, index) => (
                <li key={index} className="university-card">
                  <h2>
                    {site.siteName} ({site.category})
                  </h2>
                  <p>{language === "국문" ? ` ${site.mainService}` : `Main Service: ${site.mainService}`}</p>
                  <p>{language === "국문" ? `서비스 범위: ${site.coverage}` : `Coverage: ${site.coverage}`}</p>
                  {/* <p>{language === "국문" ? `특징 및 비고: ${site.remarks}` : `Remarks: ${site.remarks}`}</p> */}
                  <p>
                    {language === "국문" ? (
                      <>핵심 내용 요약:<br /> {renderContactWithLineBreaks(site.contact)}</>
                    ) : (
                      <>Contact: {renderContactWithLineBreaks(site.contact)}</>
                    )}
                  </p>
                  <a href={site.website} target="_blank" rel="noopener noreferrer">
                    {language === "국문" ? "리포트 다운로드" : "Visit Website"}
                  </a>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default IndustryInfoList;
