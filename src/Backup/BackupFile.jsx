import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "./App.css";

const { kakao } = window;
var map;

function MapComponent({ id }) {
    const mapRef = useRef();
    const keywordRef = useRef();
    
    useEffect(() => {
      //const mapContainer = document.getElementById('map_${id}') // 지도를 표시할 div 
      const mapOption = { 
          center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
          level: 3 // 지도의 확대 레벨
      };
      console.log(id);
      //map = new kakao.maps.Map(mapContainer, mapOption);
      map = new kakao.maps.Map(mapRef.current, mapOption);
    },[id]);
  
  
    // 선택한 장소들이 순서대로 들어가는 배열
    const markers = [];
    // 장소 검색 객체를 생성합니다
    const ps = new kakao.maps.services.Places();  
    // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
    const infowindow = new kakao.maps.InfoWindow({zIndex:1});  
    // 키워드 검색을 요청하는 함수입니다
    function searchPlaces() {
  
      const keyword = keywordRef.current.value;
  
      if (!keyword.replace(/^\s+|\s+$/g, '')) {
          alert('키워드를 입력해주세요!');
          return false;
      }
  
      // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
      ps.keywordSearch(keyword, placesSearchCB); 
    } 
    
    // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
      function placesSearchCB(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            // 검색 목록과 마커를 표출합니다
            displayPlaces(data);
            // 페이지 번호를 표출합니다
            displayPagination('#pagination');
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
            return;
        } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.');
            return;
        }
      }
  
      // 검색 결과 목록과 마커를 표출하는 함수입니다
      function displayPlaces(places) {
      
        console.log(places);
              
      var listEl = document.getElementById('placesList'), 
      menuEl = document.getElementById('menu_wrap'),
      fragment = document.createDocumentFragment(), 
      bounds = new kakao.maps.LatLngBounds(), 
      listStr = '';
      
      // 검색 결과 목록에 추가된 항목들을 제거합니다
      removeAllChildNods(listEl);
      // 지도에 표시되고 있는 마커를 제거합니다 
      // removeMarker();
  
      for ( var i=0; i<places.length; i++ ) {
          // 마커를 생성하고 지도에 표시합니다
          var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
              marker = addMarker(placePosition, i), 
              itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(placePosition);
  
            // 마커와 검색결과 항목에 mouseover 했을때
            // 해당 장소에 인포윈도우에 장소명을 표시합니다
            // mouseout 했을 때는 인포윈도우를 닫습니다
          (function(marker, title) {
                kakao.maps.event.addListener(marker, 'mouseover', function() {
                  displayInfowindow(marker, title);
              });
  
              kakao.maps.event.addListener(marker, 'mouseout', function() {
                  infowindow.close();
              }); 
  
               itemEl.onmouseover =  function () {
                  displayInfowindow(marker, title);
              };
              
              itemEl.onmouseout =  function () {
                  infowindow.close();
              };  
              
              itemEl.onclick = function () { // 리스트 항목을 클릭했을때 아래와 같이 동작 
                              
                    marker.setMap(map); // 지도 위에 마커를 표출합니다
                  markers.push(marker);  // 배열에 생성된 마커를 추가합니다
                  removeAllChildNods(listEl); // 리스트를 초기화
                  displayPagination('#pagination'); // 하단페이지 초기화 
                  infowindow.close(); // 윈도우창 닫기
                  keywordRef.current.value = ''; // 텍스트창 초기화
  
                  $("#place-taglist").append( "<p>#" + title + "</p><div id='child' class='circle' />" ); // 선택한 타이틀 #붙어서 출력
                  map.setBounds(bounds); // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
                  
              }
  
              
          })(marker, places[i].place_name);
  
          fragment.appendChild(itemEl);
      }
  
      // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
      listEl.appendChild(fragment);
      menuEl.scrollTop = 0;
      
         // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      map.setBounds(bounds); 
       
  }
  
  // 검색결과 항목을 Element로 반환하는 함수입니다
  function getListItem(index, places) {
    var el = document.createElement('li'),
    itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                '<div class="info">' +
                '   <h5>' + places.place_name + '</h5>';
  
    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>'; 
    }
                 
      itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                '</div>';           
  
    el.innerHTML = itemStr;
    el.className = 'item';
  
    return el;
  }
  
  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage 
        });
    
    return marker;
  }
  
  // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
  function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i; 
  
    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild (paginationEl.lastChild);
    }
  
    for (i=1; i<=pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;
  
        if (i===pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }
  
        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
  }
  
  // 명소리스트 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
  function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
    infowindow.setContent(content); // 설명창 내부에 표시될 글 
    infowindow.open(map, marker); // 설명창 띄움 
  }
  
  // 검색결과 목록의 자식 Element를 제거하는 함수입니다
  function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild (el.lastChild);
    }
  }

  return (
    <>
    
      <input type="text" id={'keyword_${id}'} ref={keywordRef} />
      <button onClick={searchPlaces}>검색</button>
      <div className="map_wrap">
        <div id="menu_wrap">
          <div className="option">
              <ul id='placesList'/>
              <div id='pagination'/>
          </div>
          {/* <div id={'map_${id}'} style={{ width: "500px", height: "500px" }}></div> */}
          <div ref={mapRef} id='map'></div>;
        </div>
      </div>

      <div id='place-taglist'/>
    </>
  )

}

export default MapComponent;
