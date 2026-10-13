import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { hexToRgba } from "@/shared/utils/hexToRgba";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { Button } from "../Button";
import { SeverityEnum } from "@/shared/enum/SeverityEnum";
import { Ionicons } from "@expo/vector-icons";
import Input from "../Input";
import Text from "../Text";
import { styles } from "./styles";
import useRunning, { height } from "./UseRunning";
import { formatDistance } from "@/shared/utils/formatDistance";
import { IExercise } from "@/shared/models/IExercise";

type RunningProps = {
  exercise?: IExercise;
};

export default function Running({ exercise }: RunningProps) {
  const hook = useRunning(exercise);

  return (
    <View style={styles.container}>
      <MapView
        ref={hook.mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false}
        followsUserLocation={false}
        showsCompass={true}
        showsScale={false}
        showsPointsOfInterest={false}
        showsTraffic={false}
        mapPadding={{
          top: height * 0.4,
          right: 0,
          bottom: height * 0.1,
          left: 0,
        }}
        rotateEnabled={true}
        pitchEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
        showsBuildings={false}
        customMapStyle={hook.wazeMapStyle}
        onMapReady={hook.handleMapReady}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
      >
        {/* Rota planejada (direções) */}
        {hook.directions.length > 0 && (
          <Polyline
            coordinates={hook.directions}
            strokeWidth={hook.roadWidth}
            strokeColor={hexToRgba(hook.colors.tint, 0.5)}
            lineCap="round"
            lineJoin="round"
            zIndex={1}
          />
        )}

        {/* Segmentos completados da rota planejada */}
        {hook.completedSegments.length > 0 && (
          <Polyline
            coordinates={hook.completedSegments}
            strokeWidth={hook.roadWidth}
            strokeColor={hexToRgba(hook.colors.notification.success, 0.7)}
            lineCap="round"
            lineJoin="round"
            zIndex={2}
          />
        )}

        {/* Percurso percorrido (sem rota planejada) */}
        {hook.directions.length === 0 &&
          hook.isRunning &&
          hook.routeCoordinates.length > 1 && (
            <Polyline
              coordinates={hook.routeCoordinates}
              strokeWidth={hook.roadWidth}
              strokeColor={hexToRgba(hook.colors.tint, 0.5)}
              lineCap="round"
              lineJoin="round"
              zIndex={1}
            />
          )}

        {/* Marcador de destino */}
        {hook.destination && (
          <Marker
            coordinate={{
              latitude: hook.destination.geometry.location.lat,
              longitude: hook.destination.geometry.location.lng,
            }}
            title={hook.destination.name}
            description={hook.destination.formatted_address || ""}
            pinColor={hook.colors.notification.success}
          />
        )}

        {/* Marcador de posição atual */}
        {hook.location && (
          <Marker
            coordinate={{
              latitude: hook.location.latitude,
              longitude: hook.location.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={hook.heading}
            flat={true}
            zIndex={3}
          >
            {!hook.isRunning ? (
              <View style={styles.ballHeadContainer}>
                <View style={[styles.ballHead, hook.customStyle.ballHead]} />
              </View>
            ) : (
              <View style={styles.arrowContainer}>
                <View
                  style={[
                    styles.arrowHead,
                    { borderBottomColor: hook.colors.tint },
                  ]}
                />
              </View>
            )}
          </Marker>
        )}
      </MapView>

      {/* Campo de pesquisa */}
      {!hook.isRunning && (
        <View
          style={[styles.searchContainer, hook.customStyle.searchContainer]}
        >
          {/* <View
            style={[
              styles.searchInputContainer,
              hook.customStyle.searchInputContainer,
            ]}
          >
            <Input
              style={[styles.searchInput, hook.customStyle.searchInput]}
              placeholder={hook.t(AppMessagesEnum.GPS_SEARCH_DESTINATION_LABEL)}
              placeholderTextColor={hexToRgba(hook.colors.text, 0.6)}
              value={hook.searchQuery}
              onChangeText={hook.setSearchQuery}
              onSubmitEditing={hook.handleSearch}
              editable={!hook.isRunning}
            />
            {hook.searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  hook.setSearchQuery("");
                  hook.setShowSearchResults(false);
                }}
                style={styles.searchIcon}
                disabled={hook.isRunning}
              >
                <Ionicons name="close" size={24} color={hook.colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.searchIcon}>
                <Ionicons name="search" size={24} color={hook.colors.text} />
              </View>
            )}
          </View> */}

          {hook.destination && !hook.isRunning && (
            <TouchableOpacity
              style={styles.clearRouteButton}
              onPress={hook.clearRoute}
            >
              <Text
                style={[
                  styles.clearRouteText,
                  { color: hook.colors.notification.danger },
                ]}
              >
                {hook.t(AppMessagesEnum.GPS_CLEAR_ROUTE)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Resultados da pesquisa */}
      {hook.showSearchResults &&
        hook.searchResults.length > 0 &&
        !hook.isRunning && (
          <View
            style={[
              styles.searchResultsContainer,
              hook.customStyle.searchResultsContainer,
            ]}
          >
            {hook.isSearching ? (
              <ActivityIndicator
                size="large"
                color={hook.colors.tint}
                style={styles.searchLoader}
              />
            ) : (
              hook.searchResults.map((result) => (
                <TouchableOpacity
                  key={result.place_id}
                  style={[
                    styles.searchResultItem,
                    hook.customStyle.searchResultItem,
                  ]}
                  onPress={() => hook.selectDestination(result)}
                >
                  <View style={styles.resultIconContainer}>
                    <Ionicons
                      name="location-outline"
                      size={24}
                      color={hook.colors.tint}
                    />
                  </View>
                  <View style={styles.resultTextContainer}>
                    <Text
                      style={[
                        styles.searchResultText,
                        hook.customStyle.searchResultText,
                      ]}
                      numberOfLines={1}
                    >
                      {result.name}
                    </Text>
                    <Text
                      style={[
                        styles.searchResultSubText,
                        { color: hexToRgba(hook.colors.text, 0.7) },
                      ]}
                      numberOfLines={1}
                    >
                      {result.formatted_address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

      {/* Indicador de progresso na rota */}
      {hook.destination && hook.progressOnRoute > 0 && (
        <View
          style={[styles.progressContainer, hook.customStyle.progressContainer]}
        >
          <View
            style={[
              styles.progressBar,
              { backgroundColor: hexToRgba(hook.colors.gray400, 0.5) },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: hook.colors.notification.success,
                  width: `${hook.progressOnRoute}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, hook.customStyle.progressText]}>
            {Math.round(hook.progressOnRoute)}%{" "}
            {hook.t(AppMessagesEnum.GPS_COMPLETED)}
          </Text>
        </View>
      )}

      {/* Painel de métricas */}
      {/* {hook.isRunning && ( */}
        <View
          style={[styles.metricsContainer, hook.customStyle.metricsContainer]}
        >
          <Text style={styles.metricText}>
            {hook.t(AppMessagesEnum.EXERCISE_SCREEN_DISTANCE)}:{" "}
            {formatDistance(hook.distance)}
          </Text>
          <Text style={styles.metricText}>
            {hook.t(AppMessagesEnum.USER_EXERCISE_PACE_LABEL)}: {hook.pace}{" "}
            min/km
          </Text>
          <Text style={styles.metricText}>
            {hook.t(AppMessagesEnum.EXERCISE_SCREEN_TIME)}:{" "}
            {hook.formatTime(hook.elapsedTime)}
          </Text>
          <Text style={styles.metricText}>
            {hook.t(AppMessagesEnum.GPS_CURRENT_SPEED_LABEL)}:{" "}
            {hook.currentSpeed.toFixed(1)} km/h
          </Text>
        </View>
      {/* )} */}

      {/* Botão reset */}
      {!hook.isRunning && hook.elapsedTime > 0 && (
        <Button
          onPress={() => hook.toggleRun({ reset: true })}
          icon="refresh"
          severity={SeverityEnum.DANGER}
          style={[styles.button, { bottom: 115 }]}
        />
      )}

      {/* Botão iniciar/pausar */}
      <Button
        onPress={() => hook.toggleRun({})}
        severity={hook.isRunning ? SeverityEnum.DANGER : SeverityEnum.INFO}
        icon={hook.isRunning ? "pause" : "play"}
        style={[styles.button, { bottom: hook.isRunning ? 55 : 60 }]}
      />

      {/* Botão finalizar */}
      {!hook.isRunning && (
        <Button
          title={hook.t(AppMessagesEnum.GPS_FINALIZE)}
          style={[styles.button, { bottom: 5 }]}
          severity={SeverityEnum.SECONDARY}
          onPress={hook.onConfirmFinalize}
        />
      )}

      {/* Botão de centralizar */}
      {hook.location && (
        <TouchableOpacity
          style={[styles.centerButton, hook.customStyle.centerButton]}
          onPress={() => {
            if (hook.location) {
              hook.setupWazeCamera(
                hook.location.latitude,
                hook.location.longitude,
                hook.heading,
              );
            }
          }}
        >
          <View
            style={[
              styles.centerButtonInner,
              hook.customStyle.centerButtonInner,
            ]}
          >
            <View style={[styles.centerDot, hook.customStyle.centerDot]} />
          </View>
        </TouchableOpacity>
      )}

      {/* Indicador de carregamento das direções */}
      {hook.isLoadingDirections && (
        <View
          style={[styles.loadingContainer, hook.customStyle.loadingContainer]}
        >
          <ActivityIndicator size="large" color={hook.colors.tint} />
          <Text style={[styles.loadingText, { color: hook.colors.text }]}>
            {hook.t(AppMessagesEnum.GPS_LOADING_ROUTE)}
          </Text>
        </View>
      )}
    </View>
  );
}
