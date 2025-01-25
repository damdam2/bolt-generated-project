import React, { useState, useEffect, useMemo } from 'react';
    import { getConges, getUsers, getUserQuota } from '../api';
    import { formatDate, getLogs, clearLogs } from '../utils/dateUtils';
    import './CalendarView.css';

    function CalendarView() {
      const [users, setUsers] = useState([]);
      const [conges, setConges] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
      const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
      const [logs, setLogs] = useState([]);
      const [quotas, setQuotas] = useState({});
      const [approvedDays, setApprovedDays] = useState({});

      useEffect(() => {
        const fetchData = async () => {
          try {
            clearLogs();
            const [usersData, congesData] = await Promise.all([
              getUsers(),
              getConges('admin')
            ]);
            setUsers(usersData);
            setConges(congesData.conges.map(conge => ({
              ...conge,
              startDate: formatDate(conge.startDate),
              endDate: formatDate(conge.endDate)
            })));
            setLogs(getLogs());

            const quotasData = {};
            const approvedDaysData = {};
            for (const user of usersData) {
              const quota = await getUserQuota(user.id);
              quotasData[user.id] = quota;
              const userConges = congesData.conges.filter(c => c.userId === user.id && c.status === 'approved');
              const totalApprovedDays = userConges.reduce((total, c) => {
                return total + calculateDays(c.startDate, c.endDate);
              }, 0);
              approvedDaysData[user.id] = totalApprovedDays;
            }
            setQuotas(quotasData);
            setApprovedDays(approvedDaysData);
          } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data.');
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }, []);

      const daysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
      };

      const getMonthName = (month) => {
        const monthNames = [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return monthNames[month];
      };

      const getDayOfWeek = (day, month, year) => {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        return daysOfWeek[dayOfWeek];
      };

      const generateDaysArray = () => {
        const days = [];
        const numDays = daysInMonth(currentMonth, currentYear);
        for (let i = 1; i <= numDays; i++) {
          days.push({
            day: i,
            dayOfWeek: getDayOfWeek(i, currentMonth, currentYear)
          });
        }
        return days;
      };

      const daysArray = generateDaysArray();

      const handlePrevMonth = () => {
        if (currentMonth === 0) {
          setCurrentMonth(11);
          setCurrentYear(currentYear - 1);
        } else {
          setCurrentMonth(currentMonth - 1);
        }
      };

      const handleNextMonth = () => {
        if (currentMonth === 11) {
          setCurrentMonth(0);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }
      };

      const getLeaveDays = useMemo(() => (user, conges) => {
        return conges
          .filter(conge => conge.userId === user.id)
          .map(conge => {
            console.log("CalendarView: conge before date conversion:", conge);
            const startDate = conge.startDate;
            const endDate = conge.endDate;
            const leaveDays = [];
            if (startDate && endDate) {
              console.log("CalendarView: startDate:", startDate, "endDate:", endDate);
              const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
              const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
              console.log("CalendarView: startDay:", startDay, "startMonth:", startMonth, "startYear:", startYear);
              console.log("CalendarView: endDay:", endDay, "endMonth:", endMonth, "endYear:", endYear);
              try {
                const start = new Date(startYear, startMonth - 1, startDay);
                const end = new Date(endYear, endMonth - 1, endDay);
                console.log("CalendarView: start Date object:", start, "end Date object:", end);
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                  console.log("CalendarView: d in loop:", d);
                  if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    leaveDays.push(d.getDate());
                  }
                }
              } catch (error) {
                console.error("CalendarView: Error during date processing:", error, "startDate:", startDate, "endDate:", endDate);
              }
            }
            console.log("CalendarView: leaveDays:", leaveDays);
            return {
              ...conge,
              leaveDays
            };
          });
      }, [currentMonth, currentYear]);

      const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays === 7) {
          return 6;
        }
        return diffDays;
      };

      const getRemainingDays = (user) => {
        return (quotas[user.id] || 0) - (approvedDays[user.id] || 0);
      };

      if (loading) return <div>Chargement du calendrier...</div>;
      if (error) return <div className="error">{error}</div>;

      const serviceOrder = ['projet', 'menuiserie', 'pro', 'cadre'];

      const groupedUsers = users.reduce((acc, user) => {
        if (!acc[user.poste]) {
          acc[user.poste] = [];
        }
        acc[user.poste].push(user);
        return acc;
      }, {});

      const orderedServices = Object.keys(groupedUsers).sort((a, b) => {
        return serviceOrder.indexOf(a) - serviceOrder.indexOf(b);
      });

      const serviceColors = {
        'menuiserie': '#E6E6FA', // Lavande très clair
        'projet': '#DDA0DD', // Mauve clair
        'pro': '#BA55D3', // Mauve moyen
        'cadre': '#9932CC'  // Mauve foncé
      };

      return (
        <div className="calendar-view">
          <div className="calendar-header">
            <button onClick={handlePrevMonth}>&lt;</button>
            <h2>{getMonthName(currentMonth)} {currentYear}</h2>
            <button onClick={handleNextMonth}>&gt;</button>
          </div>
          {daysArray && (
            <table className="calendar-table" aria-label="Calendrier des congés">
              <thead>
                <tr>
                  <th scope="col" style={{ position: 'sticky', left: 0, backgroundColor: '#f0f0f0', zIndex: 1 }}>Service</th>
                  <th scope="col" style={{ position: 'sticky', left: 100, backgroundColor: '#f0f0f0', zIndex: 1 }}>Nom</th>
                  <th scope="col" style={{ position: 'sticky', left: 300, backgroundColor: '#f0f0f0', zIndex: 1 }}>Solde</th>
                  {daysArray.map(({ day, dayOfWeek }) => (
                    <th key={day} className={dayOfWeek === 'D' ? 'sunday' : ''} scope="col">
                      {day}<br />{dayOfWeek}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orderedServices.map(poste => (
                  <React.Fragment key={poste}>
                    {groupedUsers[poste].map((user, index, array) => {
                      const isLastUserInService = index === array.length - 1;
                      return (
                        <tr key={user.id} style={{ borderBottom: isLastUserInService ? '2px solid #333' : 'none' }}>
                          <td scope="row" style={{ backgroundColor: serviceColors[user.poste] || '#ffffff', position: 'sticky', left: 0, zIndex: 1 }}>{poste}</td>
                          <td scope="row" style={{ position: 'sticky', left: 100, backgroundColor: '#ffffff', zIndex: 1 }}>{user.email}</td>
                          <td scope="row" style={{ position: 'sticky', left: 300, backgroundColor: '#ffffff', zIndex: 1 }}>{getRemainingDays(user)} / {quotas[user.id] || 0}</td>
                          {daysArray.map(({ day, dayOfWeek }) => {
                            const leaveDays = getLeaveDays(user, conges);
                            const isLeaveDay = leaveDays.some(leave => leave.leaveDays.includes(day));
                            const leave = leaveDays.find(leave => leave.leaveDays.includes(day));
                            let statusClass = '';
                            if (isLeaveDay) {
                              if (leave.status === 'approved') {
                                statusClass = 'approved';
                              } else if (leave.status === 'rejected') {
                                statusClass = 'rejected';
                              } else {
                                statusClass = 'pending';
                              }
                            }
                            return (
                              <td
                                key={day}
                                className={`calendar-day ${isLeaveDay ? 'leave-day' : ''} ${statusClass}`}
                                title={isLeaveDay ? `${leave?.startDate} - ${leave?.endDate}` : ''}
                                style={{ backgroundColor: dayOfWeek === 'D' ? '#444' : undefined }}
                              >
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
          {logs.length > 0 && (
            <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', backgroundColor: '#f9f9f9' }}>
              <h3>Logs de formatage de date</h3>
              <pre>
                {JSON.stringify(logs, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    export default CalendarView;
