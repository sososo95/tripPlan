import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios';

const { kakao } = window;
const maps = []; // 화면에 보여줄 맵의 갯수

function App({ id }) {
  const mapRef = useRef();
  const keywordRef = useRef();
  const placeList = useRef();
  const paginav = useRef();
  const placeTagList = useRef();
  const tagmaps = useRef([]);

  let startMarker = "";
  let endMarker = "";

  //useEffect를 사용하여 맵을 id값이 변할때 렌더링
  useEffect(() => {
    const mapOption = {
      center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
      level: 3 // 지도의 확대 레벨
    };
    maps[id] = new kakao.maps.Map(mapRef.current, mapOption);
  }, [id]);


  // 선택한 장소들이 순서대로 들어가는 배열
  //const tagmaps = [];
  // 장소 검색 객체를 생성합니다
  const ps = new kakao.maps.services.Places();
  // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
  const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
  // 키워드 검색을 요청하는 함수입니다
  function searchPlaces() {

    console.log(tagmaps);

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
      displayPagination(pagination);
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

    var listEl = placeList.current,
      menuEl = document.getElementById('menu_wrap'),
      fragment = document.createDocumentFragment(),
      bounds = new kakao.maps.LatLngBounds(),
      listStr = '';

    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(listEl);

    for (var i = 0; i < places.length; i++) {
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
      (function (marker, title) {
        kakao.maps.event.addListener(marker, 'mouseover', function () {
          displayInfowindow(marker, title);
        });

        kakao.maps.event.addListener(marker, 'mouseout', function () {
          infowindow.close();
        });

        itemEl.onmouseover = function () {
          maps[id].panTo(marker.getPosition());
          marker.setMap(maps[id]);
        };

        itemEl.onmouseout = function () {
          marker.setMap(null); // 마커 제거
          infowindow.close();
        };

        itemEl.onclick = function () { // 리스트 항목을 클릭했을때 아래와 같이 동작 

          marker.setMap(maps[id]); // 지도 위에 마커를 표출합니다
          tagmaps.current.push(marker);  // 배열에 생성된 마커를 추가합니다
          removeAllChildNods(listEl); // 리스트를 초기화
          displayPagination(paginav.current); // 하단페이지 초기화 
          infowindow.close(); // 윈도우창 닫기
          keywordRef.current.value = ''; // 텍스트창 초기화

          var tagmapBounds = new kakao.maps.LatLngBounds();
          tagmaps.current.forEach(function (marker) {
            tagmapBounds.extend(marker.getPosition());
          });

          var i = 0;
          tagmaps.current.forEach(function (marker) {
            if (i < tagmaps.current.length - 1) {

              var polyline = new kakao.maps.Polyline({
                path: [
                  new kakao.maps.LatLng(tagmaps.current[i].getPosition().getLat(), tagmaps.current[i].getPosition().getLng()),  // 출발지 좌표
                  new kakao.maps.LatLng(tagmaps.current[i + 1].getPosition().getLat(), tagmaps.current[i + 1].getPosition().getLng())   // 도착지 좌표
                ],
                strokeWeight: 3,  // 선의 두께
                strokeColor: '#FF0000',  // 선의 색상
                strokeOpacity: 1.5,  // 선의 투명도
                strokeStyle: 'solid'  // 선의 스타일
              });
              startMarker = tagmaps.current[i].getPosition().getLng() + "," + tagmaps.current[i].getPosition().getLat();
              endMarker = tagmaps.current[i + 1].getPosition().getLng() + "," + tagmaps.current[i + 1].getPosition().getLat();
              
              i++;
              polyline.setMap(maps[id]);
            }
          });
          addduration(startMarker, endMarker, i, title);
          maps[id].setBounds(tagmapBounds); // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다  
        }

      })(marker, places[i].place_name);
      fragment.appendChild(itemEl);
    }
    // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;
    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    maps[id].setBounds(bounds);
  }

  // 검색결과 항목을 Element로 반환하고 css를 적용하는 함수(동적으로 컴포넌트 생성으로 인하여 css 직접 설정)
  function getListItem(index, places) {
    var el = document.createElement('li'),
      itemStr = '<span class="markerbg marker_' + (index + 1) + '" style="background-position: 0 -' + (-32 * index) + 'px;"></span>' + '<div class="info" style="padding:10px 0 10px 55px;">' + '<h5>' + places.place_name + '</h5>';
    if (places.road_address_name) {
      itemStr += '<span>' + places.road_address_name + '</span>' + '<span class="jibun gray" style="padding-left:26px;color:#8a8a8a;background:url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_jibun.png) no-repeat;">' + places.address_name + '</span>';
    } else {
      itemStr += '<span>' + places.address_name + '</span>';
    }
    itemStr += '<span class="tel" style="color:#009900;" >' + places.phone + '</span>' + '</div>';

    el.style.listStyle = 'none';
    el.innerHTML = itemStr;
    el.className = 'item';

    el.querySelectorAll('span').forEach(function (spanEl) {
      spanEl.style.display = 'block';
      spanEl.style.marginTop = '3px';
    });
    el.querySelectorAll('.info h5, .info').forEach(function (infoEl) {
      infoEl.style.textOverflow = 'ellipsis'; // 글자가 영역을 벗어났을 때 ...
      infoEl.style.overflow = 'hidden'; // 요소의 크기를 벗어났을 때 숨김
      infoEl.style.whiteSpace = 'nowrap'; // 글자 요소가 크기를 벗어나도 줄바꿈하지않음
    });

    return el;
  }

  //이동시간 및 거리 가져오기
  function addduration(startMarker, endMarker, check, title) { 
    if(check > 0){
      axios.get('http://192.168.0.31:8080/map/distance/', {
        params: {
          start: startMarker,
          end: endMarker
        }
      })
      .then(response => {
          console.log(response.data);
          placeTagList.current.appendChild(document.createElement('div')).innerText = "약 " + response.data.distance + "   약 " + response.data.duration; // 거리 및 시간
          placeTagList.current.appendChild(document.createElement('br'))
          placeTagList.current.appendChild(document.createElement('p')).innerText = "#" + title; // #태그랑 마커 추가
          placeTagList.current.appendChild(document.createElement('div')).setAttribute('class', 'tagmarker');
      })
      .catch(error => {
          console.log(error);
      });
    } else {
      placeTagList.current.appendChild(document.createElement('p')).innerText = "#" + title; // #태그랑 마커 추가
      placeTagList.current.appendChild(document.createElement('div')).setAttribute('class', 'tagmarker');
    }
  }

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, idx, title) {
    var imageSrc = 'http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png', // 마커 이미지 url
      imageSize = new kakao.maps.Size(23, 32),  // 마커 이미지의 크기
      imgOptions = {
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
    var paginationEl = paginav.current,
      fragment = document.createDocumentFragment(),
      i;

    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
      paginationEl.removeChild(paginationEl.lastChild);
    }

    for (i = 1; i <= pagination.last; i++) {
      var el = document.createElement('a');
      el.href = "#";
      el.onclick = function (event) { event.preventDefault(); }; // #태그가 두번 눌렸을때 상단으로 이동하는것을 막기위해 선언
      el.style = "display:inline-block;margin-right:10px;";
      el.innerHTML = i;

      if (i === pagination.current) {
        el.id = "on";
        el.className = 'on';
      } else {
        el.onclick = (function (i) {
          return function (event) {
            event.preventDefault(); // 페이지 클릭후 상단으로 이동하는것을 방지
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
    const content = "<div style='padding: 5px; z-index: 1;'>" + title + "</div>";
    infowindow.setContent(content); // 설명창 내부에 표시될 글 
    console.log(content);
    infowindow.open(maps[id], marker); // 설명창 띄움 
  }

  // 검색결과 목록의 자식 Element를 제거하는 함수입니다
  function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
      el.removeChild(el.lastChild);
    }
  }

  // //지도 위에 표시되고 있는 마커를 모두 제거합니다
  // function removeMarker() {
  //   for ( var i = 0; i < markers.length; i++ ) {
  //       markers[i].setMap(null);
  //   }   
  //   markers = [];
  // }

  return (
    <>

      <input type="text" id={`keyword_${id}`} ref={keywordRef} />
      <button onClick={searchPlaces}>검색</button>
      <div className="map_wrap">

        <div id="menu_wrap">

          <div className="option" style={{ flex: 0.5 }}>
            <ul id={`placesList_${id}`} ref={placeList} style={{
              height: '465px', overflowY: 'auto'
            }} />
            <div id={`pagination_${id}`} ref={paginav} style={{
              margin: '1px auto', textAlign: 'center', borderTop: '2px solid #000000'
            }} />
          </div>

          <div id={`map_${id}`} style={{ width: '500px', height: '500px', flex: 1.2 }} ref={mapRef}></div>;

          <div style={{ width: '300px', height: '475px', flex: 0.4, margin:'10px 0',overflowY: 'auto' }}>
            <button id="placeTime" style={{ width: '150px', height: '30px', color: 'gray' }} onClick={() => {
              alert("구현예정");
            }}>최적경로추천</button>
            <div id={`place-taglist_${id}`} style={{ paddingTop: '50px'}} ref={placeTagList} />
          </div>

        </div>
      </div>


    </>
  )
}

export default App