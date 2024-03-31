import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MAINBLACK, MAINYELLOW} from '../../config/Color';
import {F_SIZE_BIGTEXT, F_SIZE_TEXT, F_SIZE_TITLE} from '../../config/Font';
import {
  fontPercent,
  heightPercent,
  widthPercent,
} from '../../config/Dimensions';
import SeatCompetition from './SeatCompetition';
import SeatSum from './SeatSum';
import { Dropdown } from '../dropdown/Dropdown';

export default function GaArea({seatsData}: any) {
  const [selectedSeats, setSelectedSeats] = useState({});

  // 드롭다운 오픈 상태
  const [dropDownOpen, setDropDownOpen] = useState(false);
  // 선택한 드롭다운 라벨
  const [selectedDrop, setSelectedDrop] = useState(null);

  const familyMembers = [
    { label: '본인', value: '본인' },
    { label: '어머니', value: '어머니' },
    { label: '아버지', value: '아버지' },
    { label: '누나', value: '누나' }
  ];

  const handleItemSelect = selectedValue => {
    setSelectedDrop(selectedValue);
  };

  const isSeatSelectedByOthers = (seatId) => {
    return Object.entries(selectedSeats).some(([key, value]) => value.seatId === seatId && key !== selectedDrop);
  };

  const handleSeatPress = (seatId: string, seatRow: string, seatCol: string) => {
    if (!selectedDrop || isSeatSelectedByOthers(seatId)) {
      // 드롭다운 미선택 상태이거나 다른 구성원이 이미 선택한 좌석인 경우
      return;
    }

    setSelectedSeats(prevSelectedSeats => ({
      ...prevSelectedSeats,
      [selectedDrop]: { seatId, seatRow, seatCol }
    }));
  };

const renderSelectedSeats = () => {
    return Object.entries(selectedSeats).map(([member, seatInfo]) => (
      <View key={member} style={styles.selectedSeatInfo}>
        <Text style={F_SIZE_TEXT}>{member} / {seatInfo.seatRow} / {seatInfo.seatCol}</Text>
      </View>
    ));
  };

  // 알파벳 행과 숫자 행을 분리하는 로직
  const alphaRows = seatsData.filter(seat => isNaN(Number(seat.row)));
  const numberRows = seatsData.filter(seat => !isNaN(Number(seat.row)));

  // 주어진 좌석 데이터로부터 좌석 UI 생성하는 함수
  const renderSeatsByRow = (seats: any) => {
    const groupedSeats = seats.reduce((acc: any, seat: any) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    }, {});

    return Object.entries(groupedSeats).map(([row, seats]) => (
      <View key={row} style={styles.row}>
        {seats.map((seat: any) => (
          <TouchableOpacity
            key={seat.id}
            style={[
              styles.seat,
              !seat.is_available && styles.reservedSeat,
              selectedSeats[selectedDrop]?.seatId === seat.seat_id && styles.selectedSeat,
              isSeatSelectedByOthers(seat.seat_id) && styles.selectedSeat, // 이 부분을 추가하여 다른 구성원이 선택한 좌석 표시
            ]}
            disabled={!seat.is_available || isSeatSelectedByOthers(seat.seat_id)}
            onPress={() => handleSeatPress(seat.seat_id, row, seat.col)}>
            <Text
              style={[
                styles.seatText,
                selectedSeats[selectedDrop]?.seatId === seat.seat_id && styles.selectedSeatText,
                !seat.is_available && styles.reservedSeatText,
              ]}>
              {seat.col}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.rowLabel}>{row}열</Text>
      </View>
    ));
  };

  return (
    <>
      <View style={styles.container}>
      <Dropdown 
      data={familyMembers}
      placeholder='가족선택'
      open={dropDownOpen}
      setOpen={setDropDownOpen}
      onSelectValue={handleItemSelect}
      width={widthPercent(120)}
      textSize={14}
      />
        {renderSeatsByRow(alphaRows)}
        <View style={styles.separator} />
        {renderSeatsByRow(numberRows)}
      </View>
      <View style={styles.row}>
        <View style={styles.available} />
        <Text style={F_SIZE_BIGTEXT}>Available</Text>
        <View style={styles.reserved} />
        <Text style={F_SIZE_BIGTEXT}>Reserved</Text>
        <View style={styles.selected} />
        <Text style={F_SIZE_BIGTEXT}>Selected</Text>
      </View>
      <View>
      {renderSelectedSeats()}
      </View>
      
      <View>
        <SeatSum selectedSeats={selectedSeats} seatsData={seatsData} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: widthPercent(340),
    backgroundColor: MAINBLACK,
    alignItems: 'flex-end',
    paddingVertical: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: {
    width: widthPercent(30),
    marginLeft: 3,
    fontFamily: 'Jalnan2TTF',
    color: '#FFFFFF',
    fontSize: fontPercent(14),
  },
  numberedRow: {
    marginTop: 10,
  },

  seatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seat: {
    width: widthPercent(30),
    height: heightPercent(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderColor: '#9A9B79',
    borderWidth: 2,
    margin: 2,
  },
  reservedSeat: {
    backgroundColor: '#877F6C',
  },
  seatText: {
    color: '#BFBFBF',
    fontFamily: 'Jalnan2TTF',
  },
  separator: {
    height: heightPercent(60),
  },
  reservedSeatText: {
    color: '#FCC434',
    fontFamily: 'Jalnan2TTF',
  },
  selectedSeat: {
    backgroundColor: '#FCC434',
  },
  selectedSeatText: {
    color: 'black',
    fontFamily: 'Jalnan2TTF',
  },

  available: {
    width: widthPercent(30),
    height: heightPercent(30),
    borderRadius: 4,
    backgroundColor: '#1C1C1C',
  },
  reserved: {
    width: widthPercent(30),
    height: heightPercent(30),
    borderRadius: 4,
    backgroundColor: '#877F6C',
  },
  selected: {
    width: widthPercent(30),
    height: heightPercent(30),
    borderRadius: 4,
    backgroundColor: MAINYELLOW,
  },
});
