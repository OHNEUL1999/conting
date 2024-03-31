import React, {useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BLUEBASE,
  MAINBLACK,
  MAINGRAY,
  MAINYELLOW,
  MINTBASE,
  REDBASE,
} from '../../config/Color.ts';
import {F_SIZE_TITLE} from '../../config/Font.ts';
import {widthPercent} from '../../config/Dimensions.tsx';
import ReservationWaitingScreen from './ReservationWaitingScreen.tsx';
import EventApplicationScreen from './EventApplicationScreen.tsx';
import {
  getDifferenceInMinutes,
  isReservationAvailable,
} from '../../utils/common/TimeFormat.ts';
import {fetchScheduleDetails} from '../../utils/realm/dao/OrderResultQuery.ts';
import {useRealm} from '../../components/realm/RealmContext.ts';
import {orderResult} from '../../api/ticket/order.ts';

const Tabs = ['결제 내역', '이벤트 내역'];

export type concertCardData = {
  ticket_id: number;
  order_id: number;
  schedule_id: string;
  performance_id: number; //local DB
  img: string; //local DB
  title: string; // local DB
  hall_location: string; //local DB
  hall_name: string; //local DB
  time: string;
  running_time: string;
  tag_type: string; // '예매완료, 환불대기, 결제대기, 기한경과', 예매 실패
  tag_color: string;
  date_tag: string;
  date_tag_color: string;
  swipe_btn_disabled?: boolean;
  btn_onPress?: () => void;
  swipe_btn_onPress?: () => void;
  swipe_btn_text?: string; // 스와이프 버튼에 들어갈 텍스트
  swipe_btn_color?: string; //스와이프 버튼의 백그라운드 색상
};
export type orderResultApiData = {
  ticket_id: number; //'티켓 이슈 ID';
  order_id: number; //'주문 내역 id';
  schedule_id: string; //'회차 ID';
  status: string; //'예매완료, 환불대기, 결제대기, 기한경과';
  pay_due_date: string; //'결제기한';
};
export type localData = {
  schedule_id: number; // 이놈으로 조회해야함 이 데이터들을
  performance_id: number; //local DB
  img: string; //local DB
  title: string; // local DB
  hall_location: string; //local DB
  hall_name: string; //local DB
  reservation_start_datetime: string; //local DB
  reservation_end_datetime: string; //local DB
  start_date: string; //local DB
  start_end_date: string; //local DB
  start_time: string;
  end_time: string;
};

function MakeConsertCardObject(
  apiData: orderResultApiData,
  localData: localData,
) {
  switch (apiData.status) {
    case '환불대기':
      if (isReservationAvailable(localData.reservation_end_datetime)) {
        return {
          ticket_id: apiData.ticket_id,
          order_id: apiData.order_id,
          schedule_id: apiData.schedule_id,
          performance_id: localData.performance_id,
          img: localData.img,
          title: localData.title,
          img_tag_type: apiData.status, // '예매완료, 환불대기, 결제대기, 기한경과, 예매실패
          img_tag_color: BLUEBASE,
          hall_location: localData.hall_location,
          hall_name: localData.hall_name,
          running_time: getDifferenceInMinutes(
            localData.start_time,
            localData.end_time,
          ),
          date_tag: '예매종료일',
          time: localData.reservation_end_datetime,
          btn_onPress: () => {
            //콘서트 상세 이동 로직
            Alert.alert('콘서트 상세로 이동');
          },
          swipe_btn_disabled: true,
        };
      } else {
        return {
          ticket_id: apiData.ticket_id,
          order_id: apiData.order_id,
          schedule_id: apiData.schedule_id,
          performance_id: localData.performance_id,
          img: localData.img,
          title: localData.title,
          img_tag_type: '예매실패', // '예매완료, 환불대기, 결제대기, 기한경과', 예매 실패
          img_tag_color: MAINGRAY,
          hall_location: localData.hall_location,
          hall_name: localData.hall_name,
          running_time: getDifferenceInMinutes(
            localData.start_time,
            localData.end_time,
          ),
          date_tag: '예매종료일',
          time: localData.reservation_end_datetime,
          btn_onPress: () => {
            //콘서트 상세 이동 로직
            Alert.alert('콘서트 상세로 이동');
          },
          swipe_btn_disabled: true,
        };
      }
    case '예매완료':
      return {
        ticket_id: apiData.ticket_id,
        order_id: apiData.order_id,
        schedule_id: apiData.schedule_id,
        performance_id: localData.performance_id,
        img: localData.img,
        title: localData.title,
        img_tag_type: apiData.status, // '예매완료, 환불대기, 결제대기, 기한경과', 예매 실패
        img_tag_color: MINTBASE,
        hall_location: localData.hall_location,
        hall_name: localData.hall_name,
        running_time: getDifferenceInMinutes(
          localData.start_time,
          localData.end_time,
        ),
        date_tag: '관람예정일',
        time: localData.start_time,
        btn_onPress: () => {
          //콘서트 상세 이동 로직
          Alert.alert('콘서트 상세로 이동');
        },
        swipe_btn_disabled: false,
        swipe_btn_onPress: () => {
          //결제 페이지로 이동 로직
          Alert.alert('앙 환불 띠');
        },
        swipe_btn_text: '환불하기', // 스와이프 버튼에 들어갈 텍스트
        swipe_btn_color: REDBASE, //스와이프 버튼의 백그라운드 색상
      };
    case '기한경과':
      return {
        ticket_id: apiData.ticket_id,
        order_id: apiData.order_id,
        schedule_id: apiData.schedule_id,
        performance_id: localData.performance_id,
        img: localData.img,
        title: localData.title,
        img_tag_type: apiData.status, // '예매완료, 환불대기, 결제대기, 기한경과', 예매 실패
        img_tag_color: MAINGRAY,
        hall_location: localData.hall_location,
        hall_name: localData.hall_name,
        running_time: getDifferenceInMinutes(
          localData.start_time,
          localData.end_time,
        ),
        date_tag: '결제마감일',
        time: apiData.pay_due_date,
        btn_onPress: () => {
          //콘서트 상세 이동 로직
          Alert.alert('콘서트 상세로 이동');
        },
        swipe_btn_disabled: true,
      };
    case '결제대기':
      return {
        ticket_id: apiData.ticket_id,
        order_id: apiData.order_id,
        schedule_id: apiData.schedule_id,
        performance_id: localData.performance_id,
        img: localData.img,
        title: localData.title,
        img_tag_type: apiData.status, // '예매완료, 환불대기, 결제대기, 기한경과', 예매 실패
        img_tag_color: MAINYELLOW,
        hall_location: localData.hall_location,
        hall_name: localData.hall_name,
        running_time: getDifferenceInMinutes(
          localData.start_time,
          localData.end_time,
        ),
        time: apiData.pay_due_date,
        date_tag: '결제마감일',
        btn_onPress: () => {
          //콘서트 상세 이동 로직
          Alert.alert('콘서트 상세로 이동');
        },
        swipe_btn_disabled: false,
        swipe_btn_onPress: () => {
          //결제 페이지로 이동 로직
          Alert.alert('앙 결제 띠');
        },
        swipe_btn_text: '결제하기', // 스와이프 버튼에 들어갈 텍스트
        swipe_btn_color: MAINYELLOW, //스와이프 버튼의 백그라운드 색상
      };
    case '환불됨':
      return {
        ticket_id: apiData.ticket_id,
        order_id: apiData.order_id,
        schedule_id: apiData.schedule_id,
        performance_id: localData.performance_id,
        img: localData.img,
        title: localData.title,
        img_tag_type: apiData.status,
        img_tag_color: MINTBASE,
        hall_location: localData.hall_location,
        hall_name: localData.hall_name,
        running_time: getDifferenceInMinutes(
          localData.start_time,
          localData.end_time,
        ),
        date_tag: '예매종료일',
        time: localData.reservation_end_datetime,
        btn_onPress: () => {
          //콘서트 상세 이동 로직
          Alert.alert('콘서트 상세로 이동');
        },
        swipe_btn_disabled: true,
      };
  }
}

export default function SearchMainScreen() {
  const [selectedTab, setSelectedTab] = useState(Tabs[0]); // 선택된 탭 상태
  const [cardList, setCardList] = useState([]);
  const realm = useRealm();
  const getOrderResultList = async () => {
    const resultList = [];
    // 1. 결제 내역 api 요청 -> 리스트
    const apiResponse = await orderResult();
    // 2. 리스트 순회하면서 해당 local db 조회 후 결과 리스트에 추가
    for (const ticketPayment of apiResponse.ticket_payments) {
      console.log('tickentPayment : =', ticketPayment);
      const localResultData = fetchScheduleDetails(
        realm,
        ticketPayment.schedule_id,
      );
      console.log('localResultData =', localResultData);
      const result = MakeConsertCardObject(ticketPayment, localResultData);
      console.log('result = ', result);
      resultList.push(result);
    }

    return resultList;
  };
  const getEventResultList = async () => {
    //이벤트 내역 조회

    return [];
  };
  // useEffect
  useEffect(() => {
    console.log('내역 페이지 진입 = ', selectedTab);
    if (selectedTab == Tabs[0]) {
      // getOrderResultList 함수의 결과를 기다린 후에 처리하도록 수정
      getOrderResultList().then(data => {
        console.log('orderResultList =', data);
        setCardList(data);
      });
    } else {
      getEventResultList().then(list => {
        setCardList(list);
      });
    }
  }, [selectedTab]); // searchQuery 또는 selectedTab이 변경될 때마다 API를 호출

  const renderTabs = () => {
    switch (selectedTab) {
      case Tabs[0]:
        return <ReservationWaitingScreen concerts={cardList} />;
      case Tabs[1]:
        return <EventApplicationScreen props={cardList} />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.context}>
        <View style={styles.tabsContainer}>
          {Tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                selectedTab === tab && styles.tabItemSelected,
              ]}
              onPress={() => setSelectedTab(tab)}>
              <Text style={F_SIZE_TITLE}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {renderTabs()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MAINBLACK,
  },
  context: {
    margin: 20,
  },
  resultItem: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultDescription: {
    fontSize: 14,
  },
  search: {},
  tabsContainer: {
    flexDirection: 'row',

    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabItem: {
    width: widthPercent(398) / 3,
    padding: 10,
    alignItems: 'center',
    // borderBottomColor: 'grey', // 경계선 색상
    borderBottomWidth: 3, // 전체 탭의 하단 경계선
  },

  tabItemSelected: {
    borderBottomWidth: 2,
    borderBottomColor: '#FCC434', // 선택된 탭 하이라이트
  },
});
