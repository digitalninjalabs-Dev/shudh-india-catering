(function () {
  function getDb() {
    if (!window.SHUDH_CONFIG || !window.SHUDH_CONFIG.firebase) return null;
    if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);
    return firebase.firestore();
  }

  function showLoader(text) {
    if (window.SHUDH_LOADER && typeof window.SHUDH_LOADER.show === "function") {
      window.SHUDH_LOADER.show(text || "Processing...");
    }
  }

  function hideLoader() {
    if (window.SHUDH_LOADER && typeof window.SHUDH_LOADER.hide === "function") {
      window.SHUDH_LOADER.hide();
    }
  }

  function withLoader(promise, text) {
    showLoader(text);
    return promise.finally(hideLoader);
  }

  function initials(name) {
    if (!name || !String(name).trim()) return "?";
    var p = String(name).trim().split(/\s+/);
    return ((p[0][0] || "") + (p[1] ? p[1][0] : "")).toUpperCase();
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function statusClass(status) {
    var s = (status || "New").toLowerCase();
    if (s === "contacted") return "bg-orange-900/20 text-orange-400 border border-orange-900/30";
    if (s === "converted") return "bg-emerald-900/20 text-emerald-400 border border-emerald-900/30";
    return "bg-blue-900/20 text-blue-400 border border-blue-900/30";
  }

  function leadStatusPillClass(status) {
    var s = (status || "New").toLowerCase();
    if (s === "contacted")
      return "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20";
    if (s === "converted")
      return "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    return "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }

  function loadInquiries(db) {
    return db.collection("inquiries")
      .get()
      .then(function (snap) {
        return snap.docs.map(function (d) {
          var x = d.data();
          x.id = d.id;
          return x;
        });
      });
  }

  function initDashboard(db) {
    var totalEl = document.getElementById("dash-stat-total");
    var newEl = document.getElementById("dash-stat-new-today");
    var convEl = document.getElementById("dash-stat-conversion");
    var tbody = document.getElementById("dash-recent-tbody");
    var mobileRecent = document.getElementById("dash-recent-mobile");
    var careerOpenEl = document.getElementById("dash-career-open");
    var careerAppsEl = document.getElementById("dash-career-apps");
    var careerNewEl = document.getElementById("dash-career-new");
    var eventBarsEl = document.getElementById("dash-event-bars");
    var statusFunnelEl = document.getElementById("dash-status-funnel");
    var weekBarsEl = document.getElementById("dash-week-bars");

    function esc(v) {
      return String(v || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    loadInquiries(db).then(function (rows) {
      var start = new Date();
      start.setHours(0, 0, 0, 0);
      var total = rows.length;
      var newToday = rows.filter(function (r) {
        var t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
        return t >= start.getTime();
      }).length;
      var converted = rows.filter(function (r) {
        return (r.status || "").toLowerCase() === "converted";
      }).length;
      var pct = total ? Math.round((converted / total) * 100) : 0;

      if (totalEl) totalEl.textContent = String(total);
      if (newEl) newEl.textContent = String(newToday);
      if (convEl) convEl.textContent = pct + "%";

      if (eventBarsEl) {
        var eventMap = {};
        rows.forEach(function (r) {
          var k = String(r.eventType || "Other").trim() || "Other";
          eventMap[k] = Number(eventMap[k] || 0) + 1;
        });
        var eventPairs = Object.keys(eventMap)
          .map(function (k) {
            return { label: k, count: eventMap[k] };
          })
          .sort(function (a, b) {
            return b.count - a.count;
          })
          .slice(0, 5);
        var maxEventCount = eventPairs.length ? eventPairs[0].count : 1;
        eventBarsEl.innerHTML = eventPairs.length
          ? eventPairs
              .map(function (x) {
                var w = Math.max(8, Math.round((x.count / maxEventCount) * 100));
                return (
                  '<div>' +
                  '<div class="flex items-center justify-between text-xs mb-1"><span class="text-stone-300 truncate pr-2">' +
                  esc(x.label) +
                  '</span><span class="text-stone-500">' +
                  String(x.count) +
                  "</span></div>" +
                  '<div class="h-2 rounded-full bg-stone-800 overflow-hidden"><div class="h-full rounded-full bg-secondary/80" style="width:' +
                  String(w) +
                  '%"></div></div></div>'
                );
              })
              .join("")
          : '<p class="text-sm text-stone-500">No event data available yet.</p>';
      }

      if (statusFunnelEl) {
        if (!rows.length) {
          statusFunnelEl.innerHTML = '<p class="text-sm text-stone-500">No status data available yet.</p>';
        } else {
        var statusMap = { New: 0, Contacted: 0, Converted: 0 };
        rows.forEach(function (r) {
          var st = String(r.status || "New").toLowerCase();
          if (st === "contacted") statusMap.Contacted += 1;
          else if (st === "converted") statusMap.Converted += 1;
          else statusMap.New += 1;
        });
        var maxStatusCount = Math.max(statusMap.New, statusMap.Contacted, statusMap.Converted, 1);
        var statusRows = [
          { key: "New", color: "bg-blue-500/80" },
          { key: "Contacted", color: "bg-orange-500/80" },
          { key: "Converted", color: "bg-emerald-500/80" }
        ];
        statusFunnelEl.innerHTML = statusRows
          .map(function (s) {
            var count = Number(statusMap[s.key] || 0);
            var w = Math.max(8, Math.round((count / maxStatusCount) * 100));
            return (
              '<div>' +
              '<div class="flex items-center justify-between text-xs mb-1"><span class="text-stone-300">' +
              s.key +
              '</span><span class="text-stone-500">' +
              String(count) +
              "</span></div>" +
              '<div class="h-2 rounded-full bg-stone-800 overflow-hidden"><div class="h-full rounded-full ' +
              s.color +
              '" style="width:' +
              String(w) +
              '%"></div></div></div>'
            );
          })
          .join("");
        }
      }

      if (weekBarsEl) {
        if (!rows.length) {
          weekBarsEl.innerHTML = '<p class="col-span-7 text-sm text-stone-500">No inquiry trend available yet.</p>';
        } else {
        var labels = [];
        var counts = [];
        for (var i = 6; i >= 0; i -= 1) {
          var d = new Date();
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() - i);
          var next = new Date(d);
          next.setDate(next.getDate() + 1);
          var c = rows.filter(function (r) {
            var t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
            return t >= d.getTime() && t < next.getTime();
          }).length;
          labels.push(d.toLocaleDateString(undefined, { weekday: "short" }));
          counts.push(c);
        }
        var maxDay = Math.max.apply(null, counts.concat([1]));
        weekBarsEl.innerHTML = labels
          .map(function (label, idx) {
            var c = counts[idx];
            var h = Math.max(10, Math.round((c / maxDay) * 100));
            return (
              '<div class="flex flex-col items-center justify-end h-full">' +
              '<span class="text-[10px] text-stone-500 mb-1">' +
              String(c) +
              "</span>" +
              '<div class="w-full max-w-[28px] rounded-t-md bg-secondary/80" style="height:' +
              String(h) +
              '%"></div>' +
              '<span class="text-[10px] text-stone-500 mt-2">' +
              esc(label) +
              "</span></div>"
            );
          })
          .join("");
        }
      }

      rows.sort(function (a, b) {
        var ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        var tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      var top = rows.slice(0, 5);

      if (tbody) {
        tbody.innerHTML = top
          .map(function (r) {
            var st = statusClass(r.status);
            return (
              '<tr class="group hover:bg-stone-800/40 transition-colors">' +
              '<td class="px-4 md:px-8 py-5"><div class="flex items-center gap-3">' +
              '<div class="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center editorial-title font-bold text-primary">' +
              initials(r.name) +
              "</div><div>" +
              '<p class="font-semibold text-stone-200">' +
              String(r.name || "—").replace(/</g, "&lt;") +
              "</p>" +
              '<p class="text-xs text-stone-500">' +
              String(r.location || "").replace(/</g, "&lt;") +
              "</p></div></div></td>" +
              '<td class="px-4 md:px-8 py-5"><div class="flex items-center gap-2">' +
              '<span class="material-symbols-outlined text-secondary text-sm">celebration</span>' +
              '<span class="text-stone-300">' +
              String(r.eventType || "—").replace(/</g, "&lt;") +
              "</span></div></td>" +
              '<td class="px-4 md:px-8 py-5 text-stone-400 text-sm">' +
              fmtDate(r.date || r.createdAt) +
              "</td>" +
              '<td class="px-4 md:px-8 py-5"><span class="' +
              st +
              ' text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">' +
              String(r.status || "New").replace(/</g, "&lt;") +
              "</span></td>" +
              '<td class="px-4 md:px-8 py-5 text-right"><a href="leads.html" class="text-secondary text-sm">Open</a></td></tr>'
            );
          })
          .join("");
        if (!top.length) {
          tbody.innerHTML =
            '<tr><td colspan="5" class="px-4 md:px-8 py-8 text-stone-500 text-center">No inquiries yet. They appear here when visitors submit the quote form.</td></tr>';
        }
      }

      if (mobileRecent) {
        if (!top.length) {
          mobileRecent.innerHTML =
            '<p class="px-4 py-10 text-stone-500 text-center text-sm">No inquiries yet. They appear here when visitors submit the quote form.</p>';
        } else {
          mobileRecent.innerHTML = top
            .map(function (r) {
              var st = statusClass(r.status);
              var name = String(r.name || "—").replace(/</g, "&lt;");
              var loc = String(r.location || "").replace(/</g, "&lt;");
              var ev = String(r.eventType || "—").replace(/</g, "&lt;");
              return (
                '<a href="leads.html" class="block px-4 py-4 border-b border-stone-800/40 active:bg-stone-800/30 transition-colors">' +
                '<div class="flex justify-between items-start gap-3">' +
                '<div class="flex items-center gap-3 min-w-0 flex-1">' +
                '<div class="w-10 h-10 shrink-0 rounded-full bg-stone-700 flex items-center justify-center editorial-title font-bold text-primary text-sm">' +
                initials(r.name) +
                "</div>" +
                '<div class="min-w-0">' +
                '<p class="font-semibold text-stone-200 truncate">' +
                name +
                "</p>" +
                '<p class="text-xs text-stone-500 truncate">' +
                ev +
                " · " +
                fmtDate(r.date || r.createdAt) +
                "</p>" +
                (loc ? '<p class="text-[11px] text-stone-600 truncate mt-0.5">' + loc + "</p>" : "") +
                "</div></div>" +
                '<span class="shrink-0 ' +
                st +
                ' text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">' +
                String(r.status || "New").replace(/</g, "&lt;") +
                "</span></div>" +
                '<p class="text-secondary text-xs font-semibold mt-3">Open in Leads →</p></a>'
              );
            })
            .join("");
        }
      }
    });

    Promise.all([db.collection("careersJobs").get(), db.collection("careersApplications").get()])
      .then(function (snaps) {
        var jobs = snaps[0].docs.map(function (d) { return d.data() || {}; });
        var apps = snaps[1].docs.map(function (d) { return d.data() || {}; });
        var openJobs = jobs.filter(function (j) { return j.visible !== false; }).length;
        var todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        var newToday = apps.filter(function (a) {
          var t = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          return t >= todayStart.getTime();
        }).length;
        if (careerOpenEl) careerOpenEl.textContent = String(openJobs);
        if (careerAppsEl) careerAppsEl.textContent = String(apps.length);
        if (careerNewEl) careerNewEl.textContent = String(newToday);
      })
      .catch(function () {
        if (careerOpenEl) careerOpenEl.textContent = "0";
        if (careerAppsEl) careerAppsEl.textContent = "0";
        if (careerNewEl) careerNewEl.textContent = "0";
      });
  }

  function initLeads(db) {
    var tbody = document.getElementById("leads-tbody");
    var countFoot = document.getElementById("leads-count-label");
    var filterEvent = document.getElementById("leads-filter-event");
    var filterStatus = document.getElementById("leads-filter-status");
    var clearBtn = document.getElementById("leads-filter-clear");
    var refreshBtn = document.getElementById("leads-refresh-btn");
    var detailName = document.getElementById("lead-detail-name");
    var detailDate = document.getElementById("lead-detail-date");
    var detailGuests = document.getElementById("lead-detail-guests");
    var detailEvent = document.getElementById("lead-detail-event");
    var detailLocation = document.getElementById("lead-detail-location");
    var detailRequirements = document.getElementById("lead-detail-requirements");
    var detailPhone = document.getElementById("lead-detail-phone");
    var detailSource = document.getElementById("lead-detail-source");
    var btnContacted = document.getElementById("lead-detail-contacted-btn");
    var btnConverted = document.getElementById("lead-detail-converted-btn");
    var btnNew = document.getElementById("lead-detail-new-btn");
    var btnDelete = document.getElementById("lead-detail-delete-btn");
    var dateFromInput = document.getElementById("leads-date-from");
    var dateToInput = document.getElementById("leads-date-to");
    var dateFromBtn = document.getElementById("leads-date-from-btn");
    var dateToBtn = document.getElementById("leads-date-to-btn");
    var searchInput = document.getElementById("leads-search-input");
    var exportBtn = document.getElementById("leads-export-csv");
    var kpiTotal = document.getElementById("leads-kpi-total");
    var kpiNew = document.getElementById("leads-kpi-new");
    var kpiContacted = document.getElementById("leads-kpi-contacted");
    var kpiConverted = document.getElementById("leads-kpi-converted");
    var manualOpen = document.getElementById("leads-manual-open");
    var manualModal = document.getElementById("leads-manual-modal");
    var manualClose = document.getElementById("leads-manual-close");
    var manualCancel = document.getElementById("leads-manual-cancel");
    var manualForm = document.getElementById("leads-manual-form");
    var manualName = document.getElementById("manual-name");
    var manualPhone = document.getElementById("manual-phone");
    var manualEvent = document.getElementById("manual-event");
    var manualGuests = document.getElementById("manual-guests");
    var manualDate = document.getElementById("manual-date");
    var manualLocation = document.getElementById("manual-location");
    var manualRequirements = document.getElementById("manual-requirements");
    if (!tbody) return;

    var allRows = [];
    var filteredRows = [];
    var selectedId = "";

    function selectedLead() {
      return (
        filteredRows.find(function (x) {
          return x.id === selectedId;
        }) || null
      );
    }

    function setDetail(lead) {
      if (!lead) {
        if (detailName) detailName.textContent = "Select a lead";
        if (detailDate) detailDate.textContent = "—";
        if (detailGuests) detailGuests.textContent = "—";
        if (detailEvent) detailEvent.textContent = "—";
        if (detailLocation) detailLocation.textContent = "—";
        if (detailRequirements) detailRequirements.textContent = "Select a lead to view details.";
        if (detailPhone) detailPhone.textContent = "—";
        if (detailSource) detailSource.textContent = "—";
        [btnContacted, btnConverted, btnNew, btnDelete].forEach(function (b) {
          if (b) b.disabled = true;
        });
        return;
      }

      if (detailName) detailName.textContent = lead.name || "—";
      if (detailDate) detailDate.textContent = fmtDate(lead.date || lead.createdAt);
      if (detailGuests) detailGuests.textContent = lead.guestCount ? String(lead.guestCount) : "—";
      if (detailEvent) detailEvent.textContent = lead.eventType || "—";
      if (detailLocation) detailLocation.textContent = lead.location || "—";
      if (detailRequirements)
        detailRequirements.textContent = lead.requirements || "No additional requirements provided.";
      if (detailPhone) detailPhone.textContent = lead.phone || "—";
      if (detailSource) detailSource.textContent = lead.source || "website";
      [btnContacted, btnConverted, btnNew, btnDelete].forEach(function (b) {
        if (b) b.disabled = false;
      });
    }

    function updateStatus(id, nextStatus) {
      return withLoader(
        db
          .collection("inquiries")
          .doc(id)
          .update({ status: nextStatus, updatedAt: new Date().toISOString() }),
        "Updating lead..."
      ).then(function () {
        allRows = allRows.map(function (x) {
          if (x.id !== id) return x;
          return Object.assign({}, x, { status: nextStatus });
        });
      });
    }

    function leadTimestamp(lead) {
      var base = lead.date || lead.createdAt || "";
      var t = new Date(base).getTime();
      return isNaN(t) ? 0 : t;
    }

    function parseDateToTs(value, isEndOfDay) {
      if (!value) return 0;
      var t = new Date(value + (isEndOfDay ? "T23:59:59" : "T00:00:00")).getTime();
      if (!isNaN(t)) return t;
      var clean = String(value).trim();
      var m = clean.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      if (m) {
        var dd = m[1];
        var mm = m[2];
        var yy = m[3];
        var iso = yy + "-" + mm + "-" + dd + (isEndOfDay ? "T23:59:59" : "T00:00:00");
        var t2 = new Date(iso).getTime();
        if (!isNaN(t2)) return t2;
      }
      return 0;
    }

    function updateKpis(rows) {
      if (kpiTotal) kpiTotal.textContent = String(rows.length);
      if (kpiNew) {
        kpiNew.textContent = String(
          rows.filter(function (x) {
            return (x.status || "New") === "New";
          }).length
        );
      }
      if (kpiContacted) {
        kpiContacted.textContent = String(
          rows.filter(function (x) {
            return (x.status || "") === "Contacted";
          }).length
        );
      }
      if (kpiConverted) {
        kpiConverted.textContent = String(
          rows.filter(function (x) {
            return (x.status || "") === "Converted";
          }).length
        );
      }
    }

    function render(rows) {
      tbody.innerHTML = rows
        .map(function (r) {
          var active = r.id === selectedId;
          return (
            '<tr data-lead-id="' +
            r.id +
            '" class="' +
            (active
              ? "bg-stone-800/40 ring-1 ring-secondary/40"
              : "bg-surface-container-low hover:bg-stone-700/30") +
            ' transition-all group cursor-pointer">' +
            '<td class="px-4 py-4 rounded-l-md"><div class="flex items-center gap-3">' +
            '<div class="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-headline font-bold text-xs">' +
            initials(r.name) +
            "</div><div class=\"flex flex-col\">" +
            '<span class="text-sm font-semibold text-on-surface">' +
            String(r.name || "—").replace(/</g, "&lt;") +
            "</span>" +
            '<span class="text-[10px] text-stone-500">ID: ' +
            r.id.substring(0, 8) +
            "</span></div></div></td>" +
            '<td class="px-4 py-4 text-xs font-medium text-stone-300">' +
            String(r.eventType || "—").replace(/</g, "&lt;") +
            "</td>" +
            '<td class="px-4 py-4 text-xs font-medium text-stone-300">' +
            fmtDate(r.date || r.createdAt) +
            "</td>" +
            '<td class="px-4 py-4 text-xs text-right text-stone-400 font-mono">' +
            String(r.phone || "—").replace(/</g, "&lt;") +
            "</td>" +
            '<td class="px-4 py-4 text-center">' +
            '<select data-inquiry-id="' +
            r.id +
            '" class="lead-status bg-surface-container-highest border-0 rounded text-[10px] py-1 px-2 text-on-surface focus:ring-1 focus:ring-secondary/40">' +
            ["New", "Contacted", "Converted"]
              .map(function (opt) {
                var sel = (r.status || "New") === opt ? " selected" : "";
                return "<option" + sel + ">" + opt + "</option>";
              })
              .join("") +
            "</select></td>" +
            '<td class="px-4 py-4 rounded-r-md text-right text-xs text-stone-500 max-w-xs truncate" title="' +
            String(r.requirements || "").replace(/"/g, "&quot;") +
            '">' +
            String((r.requirements || "").slice(0, 40)).replace(/</g, "&lt;") +
            (r.requirements && r.requirements.length > 40 ? "…" : "") +
            "</td></tr>"
          );
        })
        .join("");
      if (!rows.length) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="px-4 py-8 text-center text-stone-500">No inquiries yet.</td></tr>';
      }
      if (countFoot) countFoot.textContent = "Showing " + rows.length + " inquiries";
      updateKpis(rows);

      tbody.querySelectorAll("tr[data-lead-id]").forEach(function (rowEl) {
        rowEl.addEventListener("click", function (e) {
          if (e.target && e.target.closest("select")) return;
          selectedId = rowEl.getAttribute("data-lead-id") || "";
          render(filteredRows);
          setDetail(selectedLead());
        });
      });

      tbody.querySelectorAll(".lead-status").forEach(function (sel) {
        sel.addEventListener("change", function () {
          var id = sel.getAttribute("data-inquiry-id");
          var val = sel.value;
          updateStatus(id, val)
            .then(function () {
              applyFilters();
            })
            .catch(function () {});
        });
      });
    }

    function populateEventFilter() {
      if (!filterEvent) return;
      var selected = filterEvent.value || "All Types";
      var types = [];
      allRows.forEach(function (x) {
        if (x.eventType && types.indexOf(x.eventType) < 0) types.push(x.eventType);
      });
      filterEvent.innerHTML =
        '<option>All Types</option>' +
        types
          .map(function (t) {
            return "<option>" + String(t).replace(/</g, "&lt;") + "</option>";
          })
          .join("");
      if (types.indexOf(selected) >= 0 || selected === "All Types") {
        filterEvent.value = selected;
      }
    }

    function applyFilters() {
      var eventVal = filterEvent ? filterEvent.value : "All Types";
      var statusVal = filterStatus ? filterStatus.value : "All Statuses";
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var fromTs = parseDateToTs(dateFromInput ? dateFromInput.value : "", false);
      var toTs = parseDateToTs(dateToInput ? dateToInput.value : "", true);
      filteredRows = allRows.filter(function (x) {
        var okEvent = eventVal === "All Types" || (x.eventType || "—") === eventVal;
        var okStatus = statusVal === "All Statuses" || (x.status || "New") === statusVal;
        var ts = leadTimestamp(x);
        var okFrom = !fromTs || (ts && ts >= fromTs);
        var okTo = !toTs || (ts && ts <= toTs);
        var searchable = (
          (x.name || "") +
          " " +
          (x.phone || "") +
          " " +
          (x.location || "") +
          " " +
          (x.eventType || "") +
          " " +
          (x.requirements || "")
        ).toLowerCase();
        var okSearch = !query || searchable.indexOf(query) >= 0;
        return okEvent && okStatus && okFrom && okTo && okSearch;
      });
      if (
        !filteredRows.some(function (x) {
          return x.id === selectedId;
        })
      ) {
        selectedId = filteredRows.length ? filteredRows[0].id : "";
      }
      render(filteredRows);
      setDetail(selectedLead());
    }

    function reload() {
      withLoader(loadInquiries(db), "Loading leads...")
        .then(function (rows) {
          rows.sort(function (a, b) {
            var ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            var tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });
          allRows = rows;
          populateEventFilter();
          applyFilters();
        })
        .catch(function () {});
    }

    function openManualModal() {
      if (!manualModal) return;
      manualModal.classList.remove("hidden");
      manualModal.classList.add("flex");
    }

    function closeManualModal() {
      if (!manualModal) return;
      manualModal.classList.add("hidden");
      manualModal.classList.remove("flex");
      if (manualForm) manualForm.reset();
    }

    if (filterEvent) filterEvent.addEventListener("change", applyFilters);
    if (filterStatus) filterStatus.addEventListener("change", applyFilters);
    if (dateFromInput) {
      dateFromInput.addEventListener("change", applyFilters);
      dateFromInput.addEventListener("input", applyFilters);
    }
    if (dateToInput) {
      dateToInput.addEventListener("change", applyFilters);
      dateToInput.addEventListener("input", applyFilters);
    }
    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
      searchInput.addEventListener("keyup", applyFilters);
    }
    if (dateFromBtn && dateFromInput) {
      dateFromBtn.addEventListener("click", function () {
        if (typeof dateFromInput.showPicker === "function") dateFromInput.showPicker();
        else dateFromInput.focus();
      });
    }
    if (dateToBtn && dateToInput) {
      dateToBtn.addEventListener("click", function () {
        if (typeof dateToInput.showPicker === "function") dateToInput.showPicker();
        else dateToInput.focus();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (filterEvent) filterEvent.value = "All Types";
        if (filterStatus) filterStatus.value = "All Statuses";
        if (dateFromInput) dateFromInput.value = "";
        if (dateToInput) dateToInput.value = "";
        if (searchInput) searchInput.value = "";
        applyFilters();
      });
    }
    if (refreshBtn) refreshBtn.addEventListener("click", reload);
    if (manualOpen) manualOpen.addEventListener("click", openManualModal);
    if (manualClose) manualClose.addEventListener("click", closeManualModal);
    if (manualCancel) manualCancel.addEventListener("click", closeManualModal);
    if (manualModal) {
      manualModal.addEventListener("click", function (e) {
        if (e.target === manualModal) closeManualModal();
      });
    }
    if (manualForm) {
      manualForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = manualName ? manualName.value.trim() : "";
        var phone = manualPhone ? manualPhone.value.trim() : "";
        if (!name || !phone) return;
        withLoader(
          db.collection("inquiries").add({
            name: name,
            phone: phone,
            eventType: manualEvent && manualEvent.value.trim() ? manualEvent.value.trim() : "General",
            guestCount: manualGuests && manualGuests.value ? Number(manualGuests.value) : 0,
            date: manualDate ? manualDate.value : "",
            location: manualLocation ? manualLocation.value.trim() : "",
            requirements: manualRequirements ? manualRequirements.value.trim() : "",
            status: "New",
            source: "admin-manual",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }),
          "Saving manual lead..."
        )
          .then(function () {
            closeManualModal();
            reload();
          })
          .catch(function () {});
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        if (!filteredRows.length) return;
        var headers = [
          "Name",
          "Phone",
          "Event Type",
          "Event Date",
          "Guest Count",
          "Location",
          "Status",
          "Source",
          "Requirements",
          "Created At"
        ];
        var lines = [headers.join(",")];
        filteredRows.forEach(function (r) {
          var row = [
            r.name || "",
            r.phone || "",
            r.eventType || "",
            r.date || "",
            r.guestCount || "",
            r.location || "",
            r.status || "New",
            r.source || "website",
            r.requirements || "",
            r.createdAt || ""
          ].map(function (x) {
            return '"' + String(x).replace(/"/g, '""') + '"';
          });
          lines.push(row.join(","));
        });
        var blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "shudh-india-leads.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    if (btnContacted) {
      btnContacted.addEventListener("click", function () {
        var lead = selectedLead();
        if (!lead) return;
        updateStatus(lead.id, "Contacted").then(applyFilters).catch(function () {});
      });
    }
    if (btnConverted) {
      btnConverted.addEventListener("click", function () {
        var lead = selectedLead();
        if (!lead) return;
        updateStatus(lead.id, "Converted").then(applyFilters).catch(function () {});
      });
    }
    if (btnNew) {
      btnNew.addEventListener("click", function () {
        var lead = selectedLead();
        if (!lead) return;
        updateStatus(lead.id, "New").then(applyFilters).catch(function () {});
      });
    }
    if (btnDelete) {
      btnDelete.addEventListener("click", function () {
        var lead = selectedLead();
        if (!lead || !confirm("Delete this lead permanently?")) return;
        withLoader(
          db.collection("inquiries").doc(lead.id).delete(),
          "Deleting lead..."
        )
          .then(function () {
            allRows = allRows.filter(function (x) {
              return x.id !== lead.id;
            });
            applyFilters();
          })
          .catch(function () {});
      });
    }

    reload();
  }

  function adminPackageCard(pkg, id) {
    var name = String(pkg.name || "Package").replace(/</g, "&lt;");
    var desc = String(pkg.description || pkg.tagline || "").replace(/</g, "&lt;");
    var vis = pkg.visible !== false;
    var hi = (pkg.menuItems || pkg.highlights || []).length;
    var ord = Number(pkg.sortOrder || 0);
    return (
           '<div class="group relative bg-surface-container-high rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 md:p-8 min-w-0 flex flex-col h-full transition-all duration-500 hover:bg-stone-900/40" data-package-id="' +
      id +
      '">' +
      '<div class="flex justify-between items-start mb-6">' +
      '<div class="w-12 h-12 bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-primary transition-colors">' +
      '<span class="material-symbols-outlined text-3xl">restaurant</span></div>' +
      '<div class="flex gap-2">' +
      '<button type="button" data-edit-pkg="' +
      id +
      '" class="w-10 h-10 rounded-full bg-stone-800/50 flex items-center justify-center text-stone-500 hover:text-white hover:bg-stone-700 transition-all">' +
      '<span class="material-symbols-outlined text-lg">edit</span></button>' +
      '<button type="button" data-del-pkg="' +
      id +
      '" class="w-10 h-10 rounded-full bg-stone-800/50 flex items-center justify-center text-stone-500 hover:text-error hover:bg-error-container/20 transition-all">' +
      '<span class="material-symbols-outlined text-lg">delete</span></button></div></div>' +
      '<div class="mb-auto"><h3 class="editorial-title text-2xl font-bold mb-1">' +
      name +
      "</h3>" +
      '<p class="text-stone-500 text-sm mb-6">' +
      desc +
      "</p>" +
      '<p class="text-xs text-stone-600">' +
      "Order " +
      ord +
      " · " +
      hi +
      " highlights · " +
      (vis ? "Live" : "Hidden") +
      "</p></div></div>"
    );
  }

  function initPackagesAdmin(db) {
    var grid = document.getElementById("admin-packages-grid");
    var tableBody = document.getElementById("admin-packages-table-body");
    var modal = document.getElementById("add-package-modal");
    var form = document.getElementById("package-modal-form");
    var openBtn = document.getElementById("open-add-package");
    var cancelBtn = document.getElementById("cancel-package-modal");
    var closeBtn = document.getElementById("close-package-modal");
    var modalTitle = document.getElementById("package-modal-title");
    var saveBtn = document.getElementById("save-package-btn");
    var inputId = document.getElementById("pkg-modal-id");
    var inputName = document.getElementById("pkg-modal-name");
    var inputDesc = document.getElementById("pkg-modal-description");
    var inputHighlights = document.getElementById("pkg-modal-highlights");
    var inputPrice = document.getElementById("pkg-modal-price");
    var inputShowPrice = document.getElementById("pkg-modal-show-price");
    var inputBestFor = document.getElementById("pkg-modal-bestfor");
    var inputBadge = document.getElementById("pkg-modal-badge");
    var inputOrder = document.getElementById("pkg-modal-order");
    var inputVisible = document.getElementById("pkg-modal-visible");
    var packageCache = [];
    var draggingPkgId = "";

    function normalizeQtyToken(rawQty) {
      var t = String(rawQty != null ? rawQty : "").trim();
      if (!t) return "";
      if (/^\d+\+$/.test(t)) {
        var numPlus = t.slice(0, -1);
        return String(numPlus).padStart(2, "0") + "+";
      }
      if (/^\d+$/.test(t)) return String(Number(t)).padStart(2, "0");
      return t;
    }

    function parseMenuItems(rawText) {
      var lines = String(rawText || "")
        .split(/\n+/)
        .map(function (x) {
          return x.trim();
        })
        .filter(Boolean);
      return lines
        .map(function (line) {
          if (line.charAt(0) === "|") {
            var rest = line.slice(1).trim();
            return rest ? { qty: "", label: rest } : null;
          }
          var parts = line.split("|");
          if (parts.length >= 2) {
            var qtyPart = String(parts[0] || "").trim();
            var label = parts.slice(1).join("|").trim();
            if (!label) return null;
            if (!qtyPart) return { qty: "", label: label };
            return { qty: normalizeQtyToken(qtyPart), label: label };
          }
          var match = line.match(/^(\d+(?:\+)?)\s+(.+)$/);
          if (match) {
            return {
              qty: normalizeQtyToken(match[1]),
              label: String(match[2] || "").trim()
            };
          }
          return { qty: "", label: line };
        })
        .filter(Boolean);
    }

    function menuItemsToLines(menuItems, fallbackHighlights) {
      var structured = Array.isArray(menuItems) ? menuItems : [];
      if (structured.length) {
        return structured
          .map(function (item) {
            if (!item) return "";
            if (typeof item === "string") {
              var parsed = parseMenuItems(item);
              if (parsed.length) {
                var first = parsed[0];
                return first.qty ? first.qty + "|" + first.label : "|" + first.label;
              }
              return "";
            }
            var qty = normalizeQtyToken(
              item.qty != null && String(item.qty).trim() !== ""
                ? item.qty
                : item.quantity != null && String(item.quantity).trim() !== ""
                  ? item.quantity
                  : ""
            );
            var label = String(item.label || item.item || item.name || "").trim();
            if (!label) return "";
            return qty ? qty + "|" + label : "|" + label;
          })
          .filter(Boolean)
          .join("\n");
      }
      return (fallbackHighlights || []).join("\n");
    }

    function openModal(data, id) {
      if (!modal) return;
      var editing = !!id;
      if (inputId) inputId.value = editing ? id : "";
      if (inputName) inputName.value = editing ? data.name || "" : "";
      if (inputDesc) inputDesc.value = editing ? data.description || data.tagline || "" : "";
      if (inputHighlights)
        inputHighlights.value = editing
          ? menuItemsToLines(data.menuItems, data.highlights || [])
          : "";
      if (inputPrice) inputPrice.value = editing ? data.startingPrice || "" : "";
      if (inputShowPrice) inputShowPrice.checked = editing ? data.showPrice !== false : true;
      if (inputBestFor) inputBestFor.value = editing ? (data.bestFor || data.suitability || "") : "";
      if (inputBadge) inputBadge.value = editing ? (data.badge || "None") : "Most Popular";
      if (inputOrder) inputOrder.value = editing ? Number(data.sortOrder || 0) : packageCache.length + 1;
      if (inputVisible) inputVisible.checked = editing ? data.visible !== false : true;
      if (modalTitle) modalTitle.textContent = editing ? "Update Catering Concept" : "New Catering Concept";
      if (saveBtn) saveBtn.textContent = editing ? "Update Package" : "Create Package";
      modal.classList.remove("hidden");
    }

    function closeModal() {
      if (modal) modal.classList.add("hidden");
      if (form) form.reset();
      if (inputId) inputId.value = "";
      if (modalTitle) modalTitle.textContent = "New Catering Concept";
      if (saveBtn) saveBtn.textContent = "Create Package";
      if (inputVisible) inputVisible.checked = true;
      if (inputShowPrice) inputShowPrice.checked = true;
    }

    if (openBtn) openBtn.addEventListener("click", function () { openModal({}, ""); });
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
      });
    }
    if (window.location.hash === "#add-package-modal") {
      openModal({}, "");
    }

    function refresh() {
      withLoader(
        db.collection("packages")
          .get(),
        "Loading packages..."
      ).then(function (snap) {
          var list = snap.docs.map(function (d) {
            return { id: d.id, data: d.data() };
          });
          list.sort(function (a, b) {
            return (a.data.sortOrder || 0) - (b.data.sortOrder || 0);
          });
          packageCache = list;
          if (grid) {
            if (!list.length) {
              grid.innerHTML =
                '<p class="text-stone-500 col-span-full text-center py-12">No packages in Firestore. Add one with “Add New Package”.</p>';
            } else {
              grid.innerHTML = list.map(function (x) {
                  return adminPackageCard(x.data, x.id);
                })
                .join("");
              grid.querySelectorAll("[data-edit-pkg]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                  var pid = btn.getAttribute("data-edit-pkg");
                  var found = packageCache.find(function (x) {
                    return x.id === pid;
                  });
                  if (!found) return;
                  openModal(found.data, pid);
                });
              });
              grid.querySelectorAll("[data-del-pkg]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                  var pid = btn.getAttribute("data-del-pkg");
                  if (!pid || !confirm("Delete this package?")) return;
                  withLoader(
                    db.collection("packages")
                      .doc(pid)
                      .delete(),
                    "Deleting package..."
                  ).then(refresh).catch(function () {});
                });
              });
            }
          }
          if (tableBody) {
            tableBody.innerHTML = list
              .map(function (x) {
                var p = x.data;
                var vis = p.visible !== false;
                return (
                  '<tr draggable="true" data-pkg-row="' +
                  x.id +
                  '" class="hover:bg-stone-900/50 transition-colors border-b border-stone-800/30 cursor-move">' +
                  '<td class="px-4 lg:px-8 py-6 font-semibold">' +
                  '<span class="material-symbols-outlined text-stone-500 mr-2 align-middle">drag_indicator</span>' +
                  String(p.name || "").replace(/</g, "&lt;") +
                  "</td>" +
                  '<td class="px-4 lg:px-8 py-6 text-stone-400">' +
                  Number(p.sortOrder || 0) +
                  "</td>" +
                  '<td class="px-4 lg:px-8 py-6 text-stone-400">' +
                  ((p.menuItems || p.highlights || []).length) +
                  " Items</td>" +
                  '<td class="px-4 lg:px-8 py-6">' +
                  (vis
                    ? '<span class="text-emerald-500 text-[10px] font-bold uppercase px-2 py-1 bg-emerald-500/5 rounded-md">Live</span>'
                    : '<span class="text-stone-500 text-[10px] font-bold uppercase px-2 py-1 bg-stone-800 rounded-md">Hidden</span>') +
                  "</td>" +
                  '<td class="px-4 lg:px-8 py-6 text-right">' +
                  '<button type="button" data-edit-pkg="' +
                  x.id +
                  '" class="text-stone-500 hover:text-secondary transition-colors mr-4">Edit</button>' +
                  '<button type="button" data-del-pkg="' +
                  x.id +
                  '" class="text-stone-500 hover:text-error transition-colors">Delete</button></td></tr>'
                );
              })
              .join("");
            bindTableReorder();
            tableBody.querySelectorAll("[data-edit-pkg]").forEach(function (btn) {
              btn.addEventListener("click", function () {
                var pid = btn.getAttribute("data-edit-pkg");
                var found = packageCache.find(function (x) {
                  return x.id === pid;
                });
                if (!found) return;
                openModal(found.data, pid);
              });
            });
            tableBody.querySelectorAll("[data-del-pkg]").forEach(function (btn) {
              btn.addEventListener("click", function () {
                var pid = btn.getAttribute("data-del-pkg");
                if (!pid || !confirm("Delete?")) return;
                withLoader(
                  db.collection("packages")
                    .doc(pid)
                    .delete(),
                  "Deleting package..."
                ).then(refresh).catch(function () {});
              });
            });
          }
        });
    }

    function bindTableReorder() {
      if (!tableBody) return;
      var rows = Array.prototype.slice.call(tableBody.querySelectorAll("tr[data-pkg-row]"));
      if (!rows.length) return;

      rows.forEach(function (row) {
        row.addEventListener("dragstart", function () {
          draggingPkgId = row.getAttribute("data-pkg-row") || "";
          row.classList.add("opacity-40");
        });
        row.addEventListener("dragend", function () {
          row.classList.remove("opacity-40");
        });
        row.addEventListener("dragover", function (e) {
          e.preventDefault();
          row.classList.add("bg-stone-800/50");
        });
        row.addEventListener("dragleave", function () {
          row.classList.remove("bg-stone-800/50");
        });
        row.addEventListener("drop", function (e) {
          e.preventDefault();
          row.classList.remove("bg-stone-800/50");
          var targetId = row.getAttribute("data-pkg-row") || "";
          if (!draggingPkgId || !targetId || draggingPkgId === targetId) return;
          var fromIndex = packageCache.findIndex(function (x) {
            return x.id === draggingPkgId;
          });
          var toIndex = packageCache.findIndex(function (x) {
            return x.id === targetId;
          });
          if (fromIndex < 0 || toIndex < 0) return;

          var moved = packageCache.splice(fromIndex, 1)[0];
          packageCache.splice(toIndex, 0, moved);

          var now = new Date().toISOString();
          withLoader(
            Promise.all(
              packageCache.map(function (x, idx) {
                return db
                  .collection("packages")
                  .doc(x.id)
                  .update({ sortOrder: idx + 1, updatedAt: now });
              })
            ),
            "Saving new order..."
          )
            .then(refresh)
            .catch(function () {});
        });
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = inputName ? inputName.value.trim() : "";
        var raw = inputHighlights ? inputHighlights.value : "";
        var menuItems = parseMenuItems(raw);
        var highlights = menuItems.map(function (item) {
          var q = String(item.qty || "").trim();
          return q ? q + " " + item.label : item.label;
        });
        var badge = inputBadge ? inputBadge.value.trim() : "";
        if (badge === "None") badge = "";
        var visible = inputVisible ? inputVisible.checked : true;
        var order = inputOrder ? Number(inputOrder.value || 0) : 0;
        var existingId = inputId ? inputId.value : "";
        if (!name) return;
        var payload = {
          name: name,
          menuItems: menuItems,
          highlights: highlights,
          description: inputDesc ? inputDesc.value.trim() : "",
          startingPrice: inputPrice ? inputPrice.value.trim() : "",
          showPrice: inputShowPrice ? inputShowPrice.checked : true,
          bestFor: inputBestFor ? inputBestFor.value.trim() : "",
          badge: badge || null,
          popular: badge.toLowerCase().indexOf("popular") >= 0,
          visible: visible,
          sortOrder: order > 0 ? order : 9999,
          updatedAt: new Date().toISOString()
        };

        var write = existingId
          ? db.collection("packages").doc(existingId).set(payload, { merge: true })
          : db.collection("packages").add(
              Object.assign({ createdAt: new Date().toISOString() }, payload)
            );

        withLoader(
          write,
          existingId ? "Updating package..." : "Creating package..."
        ).then(function () {
          closeModal();
          refresh();
        }).catch(function () {});
      });
    }

    refresh();
  }

  function initGalleryAdmin(db) {
    var form = document.getElementById("media-add-form");
    var photoListEl = document.getElementById("media-admin-photo-list");
    var videoListEl = document.getElementById("media-admin-video-list");
    var typeEl = document.getElementById("media-type");
    var categoryEl = document.getElementById("media-category");
    var posterEl = document.getElementById("media-poster-url");
    var layoutEl = document.getElementById("media-layout");
    var orderEl = document.getElementById("media-order");
    if (!form || !photoListEl || !videoListEl) return;
    var mediaCache = [];
    var draggingId = "";
    var draggingType = "";

    function driveFileId(url) {
      var v = String(url || "")
        .replace(/&amp;/gi, "&")
        .trim();
      var a = v.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (a && a[1]) return a[1];
      var b = v.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (b && b[1]) return b[1];
      return "";
    }

    function thumbFor(m) {
      var url = String(m.url || "");
      var poster = String(m.posterUrl || m.thumbnail || "");
      var driveId = driveFileId(url);
      if ((m.type || "photo") === "video" && poster) return poster;
      if ((m.type || "photo") === "photo" && driveId) {
        return "https://drive.google.com/thumbnail?id=" + driveId + "&sz=w2000";
      }
      if ((m.type || "photo") === "photo") return url;
      if (driveId) return "https://drive.google.com/thumbnail?id=" + driveId + "&sz=w1000";
      var y = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (y && y[1]) return "https://img.youtube.com/vi/" + y[1] + "/hqdefault.jpg";
      return "";
    }

    function safe(v) {
      return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function normalizeCategory(v, type) {
      var raw = String(v || "").trim().toLowerCase();
      if (!raw) return type === "video" ? "weddings" : "weddings";
      var cleaned = raw.replace(/\s+/g, "-");
      if (type === "video") {
        if (cleaned === "corporate" || cleaned === "private-parties") return "weddings";
        if (cleaned === "behind-the-scenes" || cleaned === "masterclasses" || cleaned === "weddings") {
          return cleaned;
        }
        return "weddings";
      }
      if (cleaned === "weddings" || cleaned === "corporate" || cleaned === "private-parties") {
        return cleaned;
      }
      return "weddings";
    }

    function categoryOptions(selected, type) {
      var options = type === "video"
        ? [
            ["weddings", "Weddings"],
            ["behind-the-scenes", "Behind the Scenes"],
            ["masterclasses", "Masterclasses"]
          ]
        : [
            ["weddings", "Weddings"],
            ["corporate", "Corporate"],
            ["private-parties", "Private Parties"]
          ];
      return options
        .map(function (x) {
          return (
            '<option value="' +
            x[0] +
            '"' +
            (x[0] === selected ? " selected" : "") +
            ">" +
            x[1] +
            "</option>"
          );
        })
        .join("");
    }

    function syncFormCategoryOptions() {
      if (!categoryEl) return;
      var type = typeEl ? typeEl.value : "photo";
      var current = normalizeCategory(categoryEl.value, type);
      categoryEl.innerHTML = categoryOptions(current, type);
      categoryEl.value = current;
    }

    function layoutOptions(selected, type) {
      var options = type === "video"
        ? [
            ["feature", "Feature"],
            ["standard", "Standard"],
            ["wide", "Wide"]
          ]
        : [
            ["standard", "Standard"],
            ["feature", "Feature"],
            ["wide", "Wide"],
            ["tall", "Tall"]
          ];
      return options
        .map(function (x) {
          return (
            '<option value="' +
            x[0] +
            '"' +
            (x[0] === selected ? " selected" : "") +
            ">" +
            x[1] +
            "</option>"
          );
        })
        .join("");
    }

    function sortMedia(a, b) {
      var sa = Number(a.data.sortOrder || 0);
      var sb = Number(b.data.sortOrder || 0);
      if (sa !== sb) return sa - sb;
      var ta = new Date(a.data.createdAt || 0).getTime() || 0;
      var tb = new Date(b.data.createdAt || 0).getTime() || 0;
      return tb - ta;
    }

    function persistOrder() {
      var now = new Date().toISOString();
      return withLoader(
        Promise.all(
          mediaCache.map(function (x, idx) {
            return db.collection("media").doc(x.id).set(
              {
                sortOrder: idx + 1,
                updatedAt: now
              },
              { merge: true }
            );
          })
        ),
        "Saving media order..."
      );
    }

    function reorderWithinType(type, fromId, toId) {
      var sameType = mediaCache.filter(function (x) {
        return (x.data.type || "photo") === type;
      });
      var otherType = mediaCache.filter(function (x) {
        return (x.data.type || "photo") !== type;
      });
      var fromIndex = sameType.findIndex(function (x) {
        return x.id === fromId;
      });
      var toIndex = sameType.findIndex(function (x) {
        return x.id === toId;
      });
      if (fromIndex < 0 || toIndex < 0) return false;
      var moved = sameType.splice(fromIndex, 1)[0];
      sameType.splice(toIndex, 0, moved);
      mediaCache = type === "photo" ? sameType.concat(otherType) : otherType.concat(sameType);
      return true;
    }

    function renderList(items, type, targetEl) {
      if (!items.length) {
        targetEl.innerHTML =
          '<div class="col-span-full rounded-xl border border-stone-800 bg-surface-container-high p-4 text-xs text-stone-500">No ' +
          (type === "video" ? "videos" : "images") +
          " added yet.</div>";
        return;
      }
      targetEl.innerHTML = items
        .map(function (x) {
          var m = x.data;
          var url = String(m.url || "").replace(/"/g, "");
          var title = safe(m.title || "(untitled)");
          var typ = m.type || "photo";
          var category = normalizeCategory(m.category, typ);
          var layout = String(m.layout || (typ === "video" ? "feature" : "standard"));
          var posterUrl = String(m.posterUrl || "");
          var sortOrder = Number(m.sortOrder || 0);
          var thumb = thumbFor(m);
          return (
            '<div draggable="true" data-media-card="' + x.id + '" data-media-type="' + typ + '" class="bg-surface-container-high rounded-xl overflow-hidden border border-stone-800 cursor-move">' +
            (thumb
              ? '<img src="' + String(thumb).replace(/"/g, "") + '" alt="" class="w-full h-32 object-cover"/>'
              : '<div class="h-32 bg-black flex items-center justify-center text-stone-500 text-xs">Preview unavailable</div>') +
            '<div class="p-3 flex justify-between items-center gap-2">' +
            '<div class="min-w-0 flex-1"><p class="text-xs font-semibold truncate">' +
            title +
            '</p><p class="text-[10px] text-stone-500 truncate">' +
            safe(typ) +
            " · #" +
            (sortOrder || 0) +
            '</p><p class="text-[10px] text-stone-600 truncate mb-2">' +
            safe(url) +
            '</p><div class="grid grid-cols-2 gap-2">' +
            '<select data-media-id="' + x.id + '" data-edit-field="category" class="bg-stone-900 border-none rounded-lg px-2 py-1.5 text-[10px]">' +
            categoryOptions(category, typ) +
            '</select><select data-media-id="' + x.id + '" data-edit-field="layout" class="bg-stone-900 border-none rounded-lg px-2 py-1.5 text-[10px]">' +
            layoutOptions(layout, typ) +
            '</select><input data-media-id="' + x.id + '" data-edit-field="sortOrder" type="number" min="0" step="1" value="' + (sortOrder || 0) + '" class="col-span-2 bg-stone-900 border-none rounded-lg px-2 py-1.5 text-[10px]" placeholder="Order"/>' +
            (typ === "video"
              ? '<input data-media-id="' + x.id + '" data-edit-field="posterUrl" type="url" value="' + safe(posterUrl).replace(/"/g, "&quot;") + '" class="col-span-2 bg-stone-900 border-none rounded-lg px-2 py-1.5 text-[10px]" placeholder="Preview/Cover URL"/>' : "") +
            "</div></div>" +
            '<button type="button" data-del-media="' +
            x.id +
            '" class="text-stone-500 hover:text-error shrink-0"><span class="material-symbols-outlined text-sm">delete</span></button>' +
            "</div></div>"
          );
        })
        .join("");
    }

    function bindInteractions() {
      var roots = [photoListEl, videoListEl];

      roots.forEach(function (root) {
        root.querySelectorAll("[data-del-media]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var id = btn.getAttribute("data-del-media");
            if (!id || !confirm("Remove this asset?")) return;
            withLoader(
              db.collection("media")
                .doc(id)
                .delete(),
              "Deleting media..."
            ).then(refresh).catch(function () {});
          });
        });
      });

      roots.forEach(function (root) {
        root.querySelectorAll("[data-edit-field]").forEach(function (el) {
          el.addEventListener("change", function () {
            var id = el.getAttribute("data-media-id");
            var field = el.getAttribute("data-edit-field");
            if (!id || !field) return;
            var value = el.value;
            if (field === "sortOrder") value = Number(value || 0);
            var row = mediaCache.find(function (x) {
              return x.id === id;
            });
            var type = row && row.data ? row.data.type || "photo" : "photo";
            if (field === "category") value = normalizeCategory(value, type);
            var payload = { updatedAt: new Date().toISOString() };
            if (field === "category") payload.category = value;
            if (field === "layout") payload.layout = value;
            if (field === "sortOrder") payload.sortOrder = value > 0 ? value : 0;
            if (field === "posterUrl") payload.posterUrl = String(value || "").trim() || null;
            withLoader(
              db.collection("media")
                .doc(id)
                .set(payload, { merge: true }),
              "Updating media..."
            ).then(refresh).catch(function () {});
          });
        });
      });

      roots.forEach(function (root) {
        root.querySelectorAll("[data-media-card]").forEach(function (card) {
          card.addEventListener("dragstart", function () {
            draggingId = card.getAttribute("data-media-card") || "";
            draggingType = card.getAttribute("data-media-type") || "photo";
            card.classList.add("opacity-50");
          });
          card.addEventListener("dragend", function () {
            card.classList.remove("opacity-50");
          });
          card.addEventListener("dragover", function (e) {
            e.preventDefault();
            card.classList.add("ring-1", "ring-secondary/60");
          });
          card.addEventListener("dragleave", function () {
            card.classList.remove("ring-1", "ring-secondary/60");
          });
          card.addEventListener("drop", function (e) {
            e.preventDefault();
            card.classList.remove("ring-1", "ring-secondary/60");
            var targetId = card.getAttribute("data-media-card") || "";
            var targetType = card.getAttribute("data-media-type") || "";
            if (!draggingId || !targetId || draggingId === targetId) return;
            if (!draggingType || draggingType !== targetType) return;
            if (!reorderWithinType(draggingType, draggingId, targetId)) return;
            persistOrder().then(refresh).catch(function () {});
          });
        });
      });
    }

    function refresh() {
      withLoader(
        db.collection("media")
          .get(),
        "Loading media..."
      ).then(function (snap) {
          var items = snap.docs.map(function (d) {
            return { id: d.id, data: d.data() };
          });
          items.sort(sortMedia);
          mediaCache = items.slice();
          var photos = items.filter(function (x) {
            return (x.data.type || "photo") === "photo";
          });
          var videos = items.filter(function (x) {
            return (x.data.type || "photo") === "video";
          });
          renderList(photos, "photo", photoListEl);
          renderList(videos, "video", videoListEl);
          bindInteractions();
        });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var url = document.getElementById("media-url").value.trim();
      var type = document.getElementById("media-type").value;
      var title = document.getElementById("media-title").value.trim();
      var posterUrl = posterEl ? posterEl.value.trim() : "";
      var category = normalizeCategory(categoryEl ? categoryEl.value : "", type);
      var layout = layoutEl ? layoutEl.value : "standard";
      var sortOrder = orderEl ? Number(orderEl.value || 0) : 0;
      if (!url) return;
      if (/drive\.google\.com\/drive\/folders\//i.test(url)) {
        alert("Google Drive folder links are not playable. Paste each file link instead (Drive file / YouTube / Vimeo / direct mp4).");
        return;
      }
      withLoader(
        db.collection("media")
          .add({
            url: url,
            type: type,
            title: title || null,
            posterUrl: type === "video" ? (posterUrl || null) : null,
            category: category,
            layout: layout || "standard",
            sortOrder: sortOrder > 0 ? sortOrder : mediaCache.length + 1,
            visible: true,
            createdAt: new Date().toISOString()
          }),
        "Adding media..."
      ).then(function () {
          form.reset();
          refresh();
        })
        .catch(function () {});
    });

    if (typeEl) typeEl.addEventListener("change", syncFormCategoryOptions);
    syncFormCategoryOptions();
    refresh();
  }

  function initBlogAdmin(db) {
    var form = document.getElementById("blog-form");
    var listEl = document.getElementById("blog-admin-list");
    var msgEl = document.getElementById("blog-msg");
    var cancelBtn = document.getElementById("blog-edit-cancel");
    if (!form || !listEl) return;

    var inputId = document.getElementById("blog-id");
    var inputTitle = document.getElementById("blog-title");
    var inputCategory = document.getElementById("blog-category");
    var inputExcerpt = document.getElementById("blog-excerpt");
    var inputContent = document.getElementById("blog-content");
    var inputCover = document.getElementById("blog-cover");
    var inputOrder = document.getElementById("blog-order");
    var inputVisible = document.getElementById("blog-visible");

    var postsCache = [];

    function esc(v) {
      return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function resetForm() {
      if (inputId) inputId.value = "";
      if (inputTitle) inputTitle.value = "";
      if (inputCategory) inputCategory.value = "";
      if (inputExcerpt) inputExcerpt.value = "";
      if (inputContent) inputContent.value = "";
      if (inputCover) inputCover.value = "";
      if (inputOrder) inputOrder.value = "";
      if (inputVisible) inputVisible.checked = true;
      if (cancelBtn) cancelBtn.classList.add("hidden");
      if (msgEl) msgEl.textContent = "";
    }

    function render() {
      if (!postsCache.length) {
        listEl.innerHTML = '<div class="rounded-xl border border-stone-800 bg-surface-container-high p-4 text-xs text-stone-500">No blog posts created yet.</div>';
        return;
      }

      listEl.innerHTML = postsCache
        .map(function (x) {
          var d = x.data;
          var published = d.visible === false ? "Draft" : "Published";
          var badge = d.visible === false
            ? "bg-stone-800 text-stone-300 border border-stone-700"
            : "bg-emerald-900/20 text-emerald-400 border border-emerald-900/30";
          return (
            '<article class="rounded-xl border border-stone-800/80 bg-surface-container-highest p-4">' +
            '<div class="flex items-start justify-between gap-3">' +
            '<div class="min-w-0"><p class="text-sm font-semibold text-on-surface truncate">' + esc(d.title || "Untitled") + '</p>' +
            '<p class="text-xs text-stone-500 mt-1">' + esc(d.category || "General") + " · #" + String(Number(d.sortOrder || 9999)) + '</p></div>' +
            '<span class="text-[10px] px-2 py-1 rounded-full font-semibold ' + badge + '">' + published + "</span></div>" +
            '<p class="text-xs text-stone-400 mt-2 line-clamp-2">' + esc(d.excerpt || "") + "</p>" +
            '<div class="mt-3 flex items-center gap-2">' +
            '<button type="button" data-blog-edit="' + x.id + '" class="px-3 py-1.5 rounded-lg bg-stone-800 text-xs">Edit</button>' +
            '<button type="button" data-blog-delete="' + x.id + '" class="px-3 py-1.5 rounded-lg border border-red-900/40 text-red-400 text-xs">Delete</button>' +
            "</div></article>"
          );
        })
        .join("");

      listEl.querySelectorAll("[data-blog-edit]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-blog-edit");
          var row = postsCache.find(function (x) {
            return x.id === id;
          });
          if (!row || !row.data) return;
          var data = row.data;
          if (inputId) inputId.value = id;
          if (inputTitle) inputTitle.value = String(data.title || "");
          if (inputCategory) inputCategory.value = String(data.category || "");
          if (inputExcerpt) inputExcerpt.value = String(data.excerpt || "");
          if (inputContent) inputContent.value = String(data.content || "");
          if (inputCover) inputCover.value = String(data.coverImage || "");
          if (inputOrder) inputOrder.value = String(Number(data.sortOrder || 9999));
          if (inputVisible) inputVisible.checked = data.visible !== false;
          if (cancelBtn) cancelBtn.classList.remove("hidden");
          if (msgEl) msgEl.textContent = "Editing: " + String(data.title || "Untitled");
        });
      });

      listEl.querySelectorAll("[data-blog-delete]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-blog-delete");
          if (!id || !confirm("Delete this blog post?")) return;
          withLoader(
            db.collection("blogs").doc(id).delete(),
            "Deleting post..."
          )
            .then(refresh)
            .catch(function () {});
        });
      });
    }

    function refresh() {
      return withLoader(
        db.collection("blogs").get(),
        "Loading blog posts..."
      ).then(function (snap) {
        postsCache = snap.docs
          .map(function (d) {
            return { id: d.id, data: d.data() || {} };
          })
          .sort(function (a, b) {
            var oa = Number(a.data.sortOrder || 9999);
            var ob = Number(b.data.sortOrder || 9999);
            if (oa !== ob) return oa - ob;
            var ta = new Date(a.data.createdAt || 0).getTime() || 0;
            var tb = new Date(b.data.createdAt || 0).getTime() || 0;
            return tb - ta;
          });
        render();
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = String((inputTitle && inputTitle.value) || "").trim();
      if (!title) {
        if (msgEl) msgEl.textContent = "Title is required.";
        return;
      }

      var id = String((inputId && inputId.value) || "").trim();
      var payload = {
        title: title,
        category: String((inputCategory && inputCategory.value) || "").trim() || "General",
        excerpt: String((inputExcerpt && inputExcerpt.value) || "").trim(),
        content: String((inputContent && inputContent.value) || "").trim(),
        coverImage: String((inputCover && inputCover.value) || "").trim(),
        sortOrder: Number((inputOrder && inputOrder.value) || 9999),
        visible: !!(inputVisible && inputVisible.checked),
        updatedAt: new Date().toISOString()
      };

      var write = id
        ? db.collection("blogs").doc(id).set(payload, { merge: true })
        : db.collection("blogs").add(
            Object.assign({ createdAt: new Date().toISOString() }, payload)
          );

      withLoader(write, id ? "Updating post..." : "Creating post...")
        .then(function () {
          if (msgEl) msgEl.textContent = id ? "Post updated." : "Post created.";
          resetForm();
          return refresh();
        })
        .catch(function (err) {
          if (msgEl) msgEl.textContent = "Could not save post. " + ((err && err.message) || "");
        });
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        resetForm();
      });
    }

    refresh().catch(function () {});
  }

  function initSettings(db) {
    var form = document.getElementById("careers-job-form");
    var jobsList = document.getElementById("careers-jobs-admin-list");
    var applicantsList = document.getElementById("careers-applicants-admin");
    var msg = document.getElementById("careers-job-msg");
    var statLeads = document.getElementById("settings-stat-leads");
    var statPackages = document.getElementById("settings-stat-packages");
    var statMedia = document.getElementById("settings-stat-media");
    var statJobsLive = document.getElementById("settings-stat-jobs-live");
    var statApplications = document.getElementById("settings-stat-applications");
    var statUpdated = document.getElementById("settings-stats-updated");
    var widgetForm = document.getElementById("widget-settings-form");
    var widgetMsg = document.getElementById("widget-settings-msg");
    var widgetCall = document.getElementById("widget-call-number");
    var widgetWhatsapp = document.getElementById("widget-whatsapp-number");
    var widgetFacebook = document.getElementById("widget-facebook-url");
    var widgetInstagram = document.getElementById("widget-instagram-url");
    var widgetYoutube = document.getElementById("widget-youtube-url");
    if (!form || !jobsList || !applicantsList) return;

    function esc(v) {
      return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    var jobsState = [];
    var editingId = "";
    var submitBtn = form.querySelector('button[type="submit"]');
    var cancelBtn = document.getElementById("job-edit-cancel");

    function setStat(el, value) {
      if (el) el.textContent = String(value);
    }
    function setStatsUpdated(label) {
      if (statUpdated) statUpdated.textContent = "Last synced: " + label;
    }
    function loadDynamicCards() {
      if (!statLeads && !statPackages && !statMedia && !statJobsLive && !statApplications) {
        return Promise.resolve();
      }
      setStat(statLeads, "--");
      setStat(statPackages, "--");
      setStat(statMedia, "--");
      setStat(statJobsLive, "--");
      setStat(statApplications, "--");
      setStatsUpdated("syncing...");

      return Promise.allSettled([
        db.collection("inquiries").get(),
        db.collection("packages").get(),
        db.collection("media").get(),
        db.collection("careersJobs").get(),
        db.collection("careersApplications").get()
      ]).then(function (results) {
        function safeSize(idx) {
          var row = results[idx];
          if (!row || row.status !== "fulfilled" || !row.value) return 0;
          return Number(row.value.size || 0);
        }
        var leads = safeSize(0);
        var packages = safeSize(1);
        var media = safeSize(2);
        var apps = safeSize(4);
        var jobsSnap = results[3] && results[3].status === "fulfilled" ? results[3].value : null;
        var liveJobs = 0;
        if (jobsSnap && jobsSnap.docs) {
          liveJobs = jobsSnap.docs.filter(function (d) {
            var data = d.data() || {};
            return data.visible !== false;
          }).length;
        }
        setStat(statLeads, leads);
        setStat(statPackages, packages);
        setStat(statMedia, media);
        setStat(statJobsLive, liveJobs);
        setStat(statApplications, apps);
        setStatsUpdated(fmtDate(new Date().toISOString()));
      }).catch(function () {
        setStatsUpdated("could not load");
      });
    }

    function normalizeJobs(rows) {
      return (Array.isArray(rows) ? rows : [])
        .map(function (j) {
          return {
            id: String(j.id || ""),
            title: String(j.title || ""),
            category: String(j.category || "operations"),
            location: String(j.location || ""),
            jobType: String(j.jobType || ""),
            experience: String(j.experience || ""),
            summary: String(j.summary || ""),
            sortOrder: Number(j.sortOrder || 0),
            visible: j.visible !== false,
            createdAt: j.createdAt || new Date().toISOString()
          };
        })
        .sort(function (a, b) {
          var oa = Number(a.sortOrder || 0);
          var ob = Number(b.sortOrder || 0);
          if (oa !== ob) return oa - ob;
          return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
        });
    }

    function fillWidgetForm(data) {
      var raw = data || {};
      if (widgetCall) widgetCall.value = String(raw.callNumber || "+91 98765 43210");
      if (widgetWhatsapp) widgetWhatsapp.value = String(raw.whatsappNumber || "+91 98765 43210");
      if (widgetFacebook) widgetFacebook.value = String(raw.facebookUrl || "https://facebook.com/");
      if (widgetInstagram) widgetInstagram.value = String(raw.instagramUrl || "https://instagram.com/");
      if (widgetYoutube) widgetYoutube.value = String(raw.youtubeUrl || "videos.html");
    }

    function loadWidgetSettings() {
      if (!widgetForm) return Promise.resolve();
      return db
        .collection("siteSettings")
        .doc("widgetContact")
        .get()
        .then(function (snap) {
          fillWidgetForm(snap.exists ? snap.data() : null);
        })
        .catch(function () {
          fillWidgetForm(null);
        });
    }

    function resetForm() {
      form.reset();
      editingId = "";
      if (submitBtn) submitBtn.textContent = "Create Job";
      if (cancelBtn) cancelBtn.classList.add("hidden");
    }

    function fillForm(job) {
      (document.getElementById("job-title") || {}).value = job.title || "";
      (document.getElementById("job-category") || {}).value = job.category || "operations";
      (document.getElementById("job-location") || {}).value = job.location || "";
      (document.getElementById("job-type") || {}).value = job.jobType || "";
      (document.getElementById("job-experience") || {}).value = job.experience || "";
      (document.getElementById("job-summary") || {}).value = job.summary || "";
      (document.getElementById("job-order") || {}).value = Number(job.sortOrder || 0);
      editingId = job.id;
      if (submitBtn) submitBtn.textContent = "Update Job";
      if (cancelBtn) cancelBtn.classList.remove("hidden");
    }

    function renderJobs() {
      var jobs = jobsState;
      if (!jobs.length) {
        jobsList.innerHTML = '<p class="text-xs text-stone-500 px-2 py-4">No jobs created yet.</p>';
        return;
      }
      jobsList.innerHTML = jobs
        .map(function (j) {
          return (
            '<div class="p-4 sm:p-5 rounded-2xl bg-surface-container border border-outline-variant/20">' +
            '<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">' +
            '<div class="min-w-0 flex-1"><p class="font-semibold text-on-surface truncate">' + esc(j.title || "Untitled") + '</p>' +
            '<p class="text-xs text-stone-500 truncate mt-1">' + esc(j.category || "general") + " · " + esc(j.location || "N/A") + " · " + esc(j.jobType || "Full-time") + '</p></div>' +
            '<div class="flex flex-wrap items-center gap-2 shrink-0">' +
            '<button type="button" data-edit-job="' + j.id + '" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-secondary/20 text-secondary">Edit</button>' +
            '<button type="button" data-toggle-job="' + j.id + '" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold ' + (j.visible !== false ? "bg-emerald-500/15 text-emerald-400" : "bg-stone-800 text-stone-400") + '">' + (j.visible !== false ? "Live" : "Hidden") + "</button>" +
            '<button type="button" data-del-job="' + j.id + '" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-900/30 text-red-400">Delete</button>' +
            "</div></div>" +
            '<p class="text-xs sm:text-sm text-stone-400 mt-3 leading-relaxed">' + esc(j.summary || "") + "</p></div>"
          );
        })
        .join("");

      jobsList.querySelectorAll("[data-edit-job]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-edit-job");
          var job = jobs.find(function (x) { return x.id === id; });
          if (!job) return;
          fillForm(job);
        });
      });
      jobsList.querySelectorAll("[data-toggle-job]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-toggle-job");
          var job = jobs.find(function (j) {
            return j.id === id;
          });
          if (!id || !job) return;
          withLoader(
            db.collection("careersJobs").doc(id).set(
              {
                visible: !(job.visible !== false),
                updatedAt: new Date().toISOString()
              },
              { merge: true }
            ),
            "Updating job..."
          )
            .then(function () {
              return Promise.all([loadJobs(), loadDynamicCards()]);
            })
            .catch(function (err) {
              if (msg) msg.textContent = "Could not update job visibility. " + ((err && err.message) || "");
            });
        });
      });
      jobsList.querySelectorAll("[data-del-job]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-del-job");
          if (!id || !confirm("Delete this job?")) return;
          withLoader(db.collection("careersJobs").doc(id).delete(), "Deleting job...")
            .then(function () {
              if (editingId === id) resetForm();
              return Promise.all([loadJobs(), loadDynamicCards()]);
            })
            .catch(function (err) {
              if (msg) msg.textContent = "Could not delete job. " + ((err && err.message) || "");
            });
        });
      });
    }

    function loadJobs() {
      return db.collection("careersJobs").get().then(function (snap) {
        jobsState = normalizeJobs(
          snap.docs.map(function (d) {
            return Object.assign({ id: d.id }, d.data());
          })
        );
        renderJobs();
      }).catch(function () {
        jobsState = [];
        renderJobs();
      });
    }

    function loadApplicants() {
      return db.collection("careersApplications").get().then(function (snap) {
        var apps = snap.docs
          .map(function (d) {
            return Object.assign({ id: d.id }, d.data() || {});
          })
          .sort(function (a, b) {
            return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
          });
        if (!apps.length) {
          applicantsList.innerHTML = '<p class="text-xs text-stone-500 px-2 py-4">No applications submitted yet.</p>';
          return;
        }
        applicantsList.innerHTML = apps
          .map(function (a) {
            var status = String(a.status || "New");
            var statusClass =
              status === "Contacted"
                ? "bg-orange-500/10 text-orange-400"
                : status === "Converted"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-blue-500/10 text-blue-400";
            return (
              '<div class="p-4 sm:p-5 rounded-2xl bg-surface-container border border-outline-variant/20">' +
              '<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">' +
              '<div class="min-w-0 flex-1"><p class="font-semibold text-on-surface truncate">' + esc(a.fullName || "Applicant") + '</p>' +
              '<p class="text-xs text-stone-500 truncate mt-1">' + esc(a.role || "Role not selected") + " · " + esc(a.email || "") + "</p></div>" +
              '<span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded ' + statusClass + '">' + esc(status) + "</span></div>" +
              '<div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-stone-400">' +
              (a.phone ? '<span>' + esc(a.phone) + "</span>" : "") +
              (a.createdAt ? '<span>Applied: ' + esc(fmtDate(a.createdAt)) + "</span>" : "") +
              "</div>" +
              (a.experience ? '<p class="text-xs sm:text-sm text-stone-400 mt-3 leading-relaxed">' + esc(a.experience) + "</p>" : "") +
              '<div class="flex flex-wrap items-center gap-2 mt-4">' +
              ((a.resumeDownloadUrl || a.resumeUrl) ? '<a class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-secondary/20 text-secondary" href="' + String(a.resumeDownloadUrl || a.resumeUrl).replace(/"/g, "") + '" target="_blank" rel="noopener">View Resume</a>' : '<span class="px-3 py-1.5 rounded-lg text-[11px] bg-stone-800 text-stone-400">No resume</span>') +
              '<button type="button" data-app-status="' + a.id + '|New" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-400">New</button>' +
              '<button type="button" data-app-status="' + a.id + '|Contacted" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-orange-500/10 text-orange-400">Contacted</button>' +
              '<button type="button" data-app-status="' + a.id + '|Converted" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">Converted</button>' +
              '<button type="button" data-del-app="' + a.id + '" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-900/30 text-red-400">Delete</button>' +
              "</div>" +
              "</div>"
            );
          })
          .join("");

        applicantsList.querySelectorAll("[data-app-status]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var info = String(btn.getAttribute("data-app-status") || "").split("|");
            var id = info[0] || "";
            var status = info[1] || "New";
            if (!id) return;
            withLoader(
              db.collection("careersApplications").doc(id).set(
                { status: status, updatedAt: new Date().toISOString() },
                { merge: true }
              ),
              "Updating applicant..."
            )
              .then(loadApplicants)
              .then(loadDynamicCards)
              .catch(function () {});
          });
        });
        applicantsList.querySelectorAll("[data-del-app]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var id = btn.getAttribute("data-del-app") || "";
            if (!id || !confirm("Delete this application?")) return;
            withLoader(db.collection("careersApplications").doc(id).delete(), "Deleting applicant...")
              .then(loadApplicants)
              .then(loadDynamicCards)
              .catch(function () {});
          });
        });
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = (document.getElementById("job-title") || {}).value || "";
      var category = (document.getElementById("job-category") || {}).value || "operations";
      var location = (document.getElementById("job-location") || {}).value || "";
      var jobType = (document.getElementById("job-type") || {}).value || "";
      var experience = (document.getElementById("job-experience") || {}).value || "";
      var summary = (document.getElementById("job-summary") || {}).value || "";
      var sortOrder = Number(((document.getElementById("job-order") || {}).value || 0));
      if (!String(title).trim()) return;
      var wasEditing = !!editingId;
      if (editingId) {
        withLoader(
          db.collection("careersJobs").doc(editingId).set(
            {
              title: String(title).trim(),
              category: String(category).trim(),
              location: String(location).trim(),
              jobType: String(jobType).trim(),
              experience: String(experience).trim(),
              summary: String(summary).trim(),
              sortOrder: sortOrder > 0 ? sortOrder : 0,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          ),
          "Updating job..."
        )
          .then(function () {
            resetForm();
            if (msg) msg.textContent = wasEditing ? "Job updated." : "Job created.";
            return Promise.all([loadJobs(), loadDynamicCards()]);
          })
          .catch(function (err) {
            if (msg) msg.textContent = "Could not save job. " + ((err && err.message) || "");
          });
      } else {
        withLoader(
          db.collection("careersJobs").add({
            title: String(title).trim(),
            category: String(category).trim(),
            location: String(location).trim(),
            jobType: String(jobType).trim(),
            experience: String(experience).trim(),
            summary: String(summary).trim(),
            sortOrder: sortOrder > 0 ? sortOrder : 0,
            visible: true,
            createdAt: new Date().toISOString()
          }),
          "Creating job..."
        )
          .then(function () {
            resetForm();
            if (msg) msg.textContent = wasEditing ? "Job updated." : "Job created.";
            return Promise.all([loadJobs(), loadDynamicCards()]);
          })
          .catch(function (err) {
            if (msg) msg.textContent = "Could not save job. " + ((err && err.message) || "");
          });
      }
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        resetForm();
      });
    }

    if (widgetForm) {
      widgetForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var payload = {
          callNumber: String((widgetCall && widgetCall.value) || "").trim(),
          whatsappNumber: String((widgetWhatsapp && widgetWhatsapp.value) || "").trim(),
          facebookUrl: String((widgetFacebook && widgetFacebook.value) || "").trim(),
          instagramUrl: String((widgetInstagram && widgetInstagram.value) || "").trim(),
          youtubeUrl: String((widgetYoutube && widgetYoutube.value) || "").trim(),
          updatedAt: new Date().toISOString()
        };
        if (widgetMsg) widgetMsg.textContent = "Saving...";
        withLoader(
          db.collection("siteSettings").doc("widgetContact").set(payload, { merge: true }),
          "Saving widget settings..."
        )
          .then(function () {
            if (widgetMsg) widgetMsg.textContent = "Widget settings updated.";
          })
          .catch(function (err) {
            if (widgetMsg) widgetMsg.textContent = "Could not save widget settings. " + ((err && err.message) || "");
          });
      });
    }

    withLoader(
      Promise.all([loadJobs(), loadApplicants(), loadDynamicCards(), loadWidgetSettings()]),
      "Loading careers settings..."
    ).catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = (window.location.pathname.split("/").pop() || "").toLowerCase();
    if (page === "login.html") return;

    var db = getDb();
    if (!db) return;

    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) return;
      if (page === "dashboard.html") initDashboard(db);
      else if (page === "leads.html") initLeads(db);
      else if (page === "packages.html") initPackagesAdmin(db);
      else if (page === "gallery.html") initGalleryAdmin(db);
      else if (page === "blog.html") initBlogAdmin(db);
      else if (page === "settings.html") initSettings(db);
    });
  });
})();
