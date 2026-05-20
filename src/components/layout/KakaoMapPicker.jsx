import { useEffect, useRef, useState } from "react";
import { C, S } from "../../styles/theme";
import { Icon } from "../common/Icons";

/* ─── KakaoMap Location Picker ───────────────────────────────── */
function KakaoMapPicker({ onSelect, onClose }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapObjRef = useRef(null);
  const inputRef = useRef(null);

  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearch] = useState("");
  const [suggestions, setSugg] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        setLoading(false);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        });
        const marker = new window.kakao.maps.Marker({ position: map.getCenter() });
        marker.setMap(map);
        mapObjRef.current = map;
        markerRef.current = marker;

        // 시작 시 현재 위치로 이동
        handleCurrentLocation(map, marker);

        // 지도 클릭으로 핀 이동
        window.kakao.maps.event.addListener(map, "click", (e) => {
          marker.setPosition(e.latLng);
          reverseGeocode(e.latLng);
        });
      });
    };

    return () => { document.head.removeChild(script); };
  }, []);

  /* 좌표 → 주소 변환 */
  const reverseGeocode = (latlng) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(latlng.getLng(), latlng.getLat(), (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const region = result.find((r) => r.region_type === "H");
        if (region) {
          setAddress({
            sido: region.region_1depth_name,
            sigungu: region.region_2depth_name,
            full: region.address_name,
          });
        }
      }
    });
  };

  /* 현재 위치 */
  const handleCurrentLocation = (map, marker) => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        (map || mapObjRef.current).setCenter(latlng);
        (map || mapObjRef.current).setLevel(3);
        (marker || markerRef.current).setPosition(latlng);
        reverseGeocode(latlng);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  /* 주소 검색 자동완성 */
  const handleSearchInput = (val) => {
    setSearch(val);
    if (!val.trim() || !window.kakao) { setSugg([]); return; }
    setSearching(true);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(val, (data, status) => {
      setSearching(false);
      if (status === window.kakao.maps.services.Status.OK) setSugg(data.slice(0, 5));
      else setSugg([]);
    });
  };

  /* 검색 결과 클릭 */
  const handleSuggSelect = (place) => {
    const latlng = new window.kakao.maps.LatLng(place.y, place.x);
    mapObjRef.current.setCenter(latlng);
    mapObjRef.current.setLevel(3);
    markerRef.current.setPosition(latlng);
    reverseGeocode(latlng);
    setSearch(place.place_name);
    setSugg([]);
    inputRef.current?.blur();
  };

  const handleConfirm = () => { if (address) onSelect({ address }); };

  const baseInput = {
    background: C.bgEl, border: `1px solid ${C.bdrMd}`,
    borderRadius: 9, fontSize: 13, color: C.txtPri,
    outline: "none", fontFamily: "'Space Grotesk',sans-serif",
    boxSizing: "border-box", width: "100%",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(10,14,20,0.92)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: C.bgCard, border: `1px solid ${C.bdrMd}`,
        borderRadius: 20, width: "100%", maxWidth: 640,
        overflow: "hidden", boxShadow: `0 0 60px rgba(34,211,238,0.08)`,
        display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${C.bdr}` }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.txtPri, marginBottom: 3 }}>촬영 위치 선택</div>
            <div style={{ fontSize: 12, color: C.txtSec }}>주소 검색 또는 지도를 클릭해 위치를 선택하세요</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.txtMut, display: "flex" }}>
            <Icon.x width={18} height={18} />
          </button>
        </div>

        {/* 검색창 + 현재위치 버튼 */}
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.bdr}`, display: "flex", gap: 8 }}>
          {/* 검색창 */}
          <div style={{ flex: 1, position: "relative" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.txtMut} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="도로명, 장소명으로 검색"
              style={{ ...baseInput, padding: "10px 36px 10px 36px" }}
            />
            {searching && (
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", border: `2px solid ${C.bdrMd}`, borderTop: `2px solid ${C.cyan}`, animation: "spin 0.8s linear infinite" }} />
            )}

            {/* 자동완성 드롭다운 */}
            {suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: C.bgCard, border: `1px solid ${C.bdrMd}`, borderRadius: 12, zIndex: 10, overflow: "hidden", boxShadow: "0 8px 28px rgba(0,0,0,0.4)" }}>
                {suggestions.map((place, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggSelect(place)}
                    style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", background: "none", border: "none", borderBottom: i < suggestions.length - 1 ? `1px solid ${C.bdr}` : "none", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.bgEl}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.txtPri, marginBottom: 2 }}>{place.place_name}</div>
                      <div style={{ fontSize: 11, color: C.txtMut }}>{place.road_address_name || place.address_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 현재 위치 버튼 */}
          <button
            onClick={() => handleCurrentLocation()}
            disabled={locating}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 16px", borderRadius: 9, flexShrink: 0,
              background: locating ? C.cyanLt : C.bgEl,
              border: `1px solid ${locating ? C.cyanBdr : C.bdrMd}`,
              cursor: locating ? "not-allowed" : "pointer",
              color: locating ? C.cyan : C.txtSec,
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
            }}
            className="btn-h"
          >
            {locating ? (
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${C.cyanBdr}`, borderTop: `2px solid ${C.cyan}`, animation: "spin 0.8s linear infinite" }} />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
              </svg>
            )}
            현재 위치
          </button>
        </div>

        {/* 지도 */}
        <div style={{ position: "relative" }}>
          <div ref={mapRef} style={{ width: "100%", height: 340 }} />
          {loading && (
            <div style={{ position: "absolute", inset: 0, background: C.bgEl, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${C.bdrMd}`, borderTop: `2px solid ${C.cyan}`, animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 13, color: C.txtSec }}>지도 불러오는 중...</span>
            </div>
          )}
          {!loading && (
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", padding: "5px 14px", borderRadius: 20, background: "rgba(10,14,20,0.7)", fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", backdropFilter: "blur(8px)", pointerEvents: "none" }}>
              핀을 드래그하거나 지도를 클릭해 위치 조정
            </div>
          )}
        </div>

        {/* 선택된 주소 + 확인 버튼 */}
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: address ? C.cyanLt : C.bgEl, border: `1px solid ${address ? C.cyanBdr : C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={address ? C.cyan : C.txtMut} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              {address ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.txtPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{address.full}</div>
                  <div style={{ fontSize: 11, color: C.txtMut, marginTop: 2 }}>{address.sido} · {address.sigungu}</div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: C.txtMut }}>위치를 선택해주세요</div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={onClose} style={{ ...S.btn("ghost"), fontSize: 13, padding: "9px 18px" }} className="btn-h">취소</button>
            <button onClick={handleConfirm} disabled={!address} style={{ ...S.btn("primary", !address), fontSize: 13, padding: "9px 20px" }} className="btn-h">
              <Icon.check width={14} height={14} /> 선택 완료
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export { KakaoMapPicker };